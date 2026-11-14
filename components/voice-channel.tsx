'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSocket } from '@/hooks/use-socket'

type VoiceSignal = { description?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }

export default function VoiceChannel({ serverId, channelId, channelName }: { serverId: string; channelId: string; channelName: string }) {
  const { socket, isConnected, joinVoiceChannel, leaveVoiceChannel, sendVoiceSignal } = useSocket()
  const [joined, setJoined] = useState(false)
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState('')
  const [peers, setPeers] = useState<string[]>([])
  const localStream = useRef<MediaStream | null>(null)
  const connections = useRef(new Map<string, RTCPeerConnection>())
  const audioElements = useRef(new Map<string, HTMLAudioElement>())
  const pendingCandidates = useRef(new Map<string, RTCIceCandidateInit[]>())

  const closePeer = useCallback((id: string) => {
    connections.current.get(id)?.close()
    connections.current.delete(id)
    audioElements.current.get(id)?.remove()
    audioElements.current.delete(id)
    pendingCandidates.current.delete(id)
    setPeers(current => current.filter(peer => peer !== id))
  }, [])

  const createPeer = useCallback((id: string) => {
    const existing = connections.current.get(id)
    if (existing) return existing
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    localStream.current?.getTracks().forEach(track => pc.addTrack(track, localStream.current!))
    pc.onicecandidate = event => {
      if (event.candidate) sendVoiceSignal(id, { candidate: event.candidate.toJSON() })
    }
    pc.ontrack = event => {
      let audio = audioElements.current.get(id)
      if (!audio) {
        audio = new Audio()
        audio.autoplay = true
        audioElements.current.set(id, audio)
      }
      audio.srcObject = event.streams[0]
      void audio.play().catch(() => setError('Allow audio playback in your browser to hear other participants.'))
    }
    pc.onconnectionstatechange = () => {
      if (['failed', 'closed'].includes(pc.connectionState)) closePeer(id)
    }
    connections.current.set(id, pc)
    setPeers(current => current.includes(id) ? current : [...current, id])
    return pc
  }, [closePeer, sendVoiceSignal])

  useEffect(() => {
    if (!socket) return
    const onPeers = async (ids: string[]) => {
      for (const id of ids) {
        const pc = createPeer(id)
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        sendVoiceSignal(id, { description: pc.localDescription })
      }
    }
    const onPeerJoined = (peer: { socketId: string }) => { createPeer(peer.socketId) }
    const onPeerLeft = (peer: { socketId: string }) => closePeer(peer.socketId)
    const onSignal = async ({ socketId, signal }: { socketId: string; signal: VoiceSignal }) => {
      const pc = createPeer(socketId)
      try {
        if (signal.description) {
          await pc.setRemoteDescription(signal.description)
          if (signal.description.type === 'offer') {
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            sendVoiceSignal(socketId, { description: pc.localDescription })
          }
          for (const candidate of pendingCandidates.current.get(socketId) ?? []) await pc.addIceCandidate(candidate)
          pendingCandidates.current.delete(socketId)
        } else if (signal.candidate) {
          if (pc.remoteDescription) await pc.addIceCandidate(signal.candidate)
          else pendingCandidates.current.set(socketId, [...(pendingCandidates.current.get(socketId) ?? []), signal.candidate])
        }
      } catch (e) {
        console.error('Voice negotiation failed', e)
        setError('Could not establish the voice connection. Try leaving and rejoining.')
      }
    }
    socket.on('voice:peers', onPeers)
    socket.on('voice:peer-joined', onPeerJoined)
    socket.on('voice:peer-left', onPeerLeft)
    socket.on('voice:signal', onSignal)
    return () => {
      socket.off('voice:peers', onPeers)
      socket.off('voice:peer-joined', onPeerJoined)
      socket.off('voice:peer-left', onPeerLeft)
      socket.off('voice:signal', onSignal)
    }
  }, [socket, createPeer, closePeer, sendVoiceSignal])

  const join = async () => {
    if (!isConnected) { setError('Connecting to voice service… Please try again in a moment.'); return }
    try {
      setError('')
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      joinVoiceChannel(serverId, channelId)
      setJoined(true)
    } catch (e) {
      setError(e instanceof Error && e.name === 'NotAllowedError' ? 'Microphone permission is required to join voice.' : 'Could not access your microphone.')
    }
  }

  const leave = useCallback(() => {
    leaveVoiceChannel(serverId, channelId)
    connections.current.forEach(pc => pc.close())
    connections.current.clear()
    audioElements.current.forEach(audio => { audio.pause(); audio.srcObject = null; audio.remove() })
    audioElements.current.clear()
    localStream.current?.getTracks().forEach(track => track.stop())
    localStream.current = null
    setPeers([])
    setJoined(false)
    setMuted(false)
  }, [leaveVoiceChannel, serverId, channelId])

  useEffect(() => () => { leave() }, [leave])

  const toggleMute = () => {
    const next = !muted
    localStream.current?.getAudioTracks().forEach(track => { track.enabled = !next })
    setMuted(next)
  }

  return (
    <section className="mx-3 mb-3 rounded-lg border border-gray-700 bg-gray-900/70 p-3" aria-label={`${channelName} voice channel`}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Volume2 className="h-4 w-4 text-green-400" />{channelName}<span className="ml-auto text-xs font-normal text-gray-400">{joined ? `Connected · ${peers.length + 1}` : 'Voice channel'}</span></div>
      {joined && <div className="mb-3 space-y-1 text-xs text-gray-300"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-400" />You {muted ? '(muted)' : ''}</div>{peers.map(peer => <div key={peer} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-400" />Participant {peer.slice(0, 5)}</div>)}</div>}
      {error && <p role="status" className="mb-2 text-xs text-amber-300">{error}</p>}
      {joined ? <div className="flex gap-2"><Button size="sm" variant="secondary" aria-label={muted ? 'Unmute microphone' : 'Mute microphone'} onClick={toggleMute}>{muted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}{muted ? 'Unmute' : 'Mute'}</Button><Button size="sm" variant="destructive" onClick={leave}><PhoneOff className="mr-2 h-4 w-4" />Disconnect</Button></div> : <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={join}><Mic className="mr-2 h-4 w-4" />Join Voice</Button>}
    </section>
  )
}
