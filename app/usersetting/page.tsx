"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation';


interface UserData {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  status?: string;
  createdAt: string;
}

export default function UserSettingsPage() {
  const [activeSection, setActiveSection] = useState<string>("my-account");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // State for edit modals
  const [isDisplayNameEditOpen, setIsDisplayNameEditOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isUsernameEditOpen, setIsUsernameEditOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isEmailEditOpen, setIsEmailEditOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isPhoneNumberEditOpen, setIsPhoneNumberEditOpen] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/me`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch user data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching user data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdateUser = async (field: keyof UserData, value: string) => {
    setIsEditing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `${field} updated successfully.`, 
        });
        fetchUserData(); // Re-fetch user data to update UI
        // Close relevant modal
        if (field === 'displayName') setIsDisplayNameEditOpen(false);
        if (field === 'username') setIsUsernameEditOpen(false);
        if (field === 'email') setIsEmailEditOpen(false);
        if (field === 'phoneNumber') setIsPhoneNumberEditOpen(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || `Failed to update ${field}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    setIsEditing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully.",
        });
        setIsPasswordChangeOpen(false);
        fetchUserData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to change password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while changing password.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const getMaskedEmail = (email: string) => {
    const [name, domain] = email.split('@');
    const maskedName = name.length > 3 ? name.substring(0, 3) + '*****' : '*****';
    return `${maskedName}@${domain}`;
  };

  const renderContent = () => {
    switch (activeSection) {
      case "my-account":
        return (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6 w-full">
              <h1 className="text-2xl font-bold text-white">My Account</h1>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-white" onClick={() => router.back()}>
                  <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Security and Standing Tabs */}
            <div className="flex space-x-4 mb-6 w-full">
              <Button variant="link" className="px-0 text-blue-400 border-b-2 border-blue-400 rounded-none">Security</Button>
              <Button variant="link" className="px-0 text-gray-400 hover:text-white">Standing</Button>
            </div>

            {/* User Profile Section */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6 relative w-full">
              <div className="absolute top-0 left-0 w-full h-20 bg-red-800 rounded-t-lg" /> {/* Placeholder for banner */}
              <div className="relative flex items-end -mt-10 mb-4">
                {/* Avatar Placeholder */}
                <div className="w-24 h-24 rounded-full bg-gray-600 border-4 border-gray-900 flex items-center justify-center text-gray-300 text-xs mr-4">
                  {userData?.avatarUrl ? <img src={userData.avatarUrl} alt="User Avatar" className="rounded-full" /> : "Avatar"}
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm">
                  Edit User Profile
                </Button>
              </div>
              <div className="bg-gray-800 rounded-md p-4 mt-4 w-full">
                <p className="text-xl font-semibold text-white mb-2">{userData?.displayName || userData?.username}</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">DISPLAY NAME</label>
                    <p className="text-white text-lg">{userData?.displayName || 'N/A'}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-0 text-blue-400 hover:text-blue-300" 
                      onClick={() => {
                        setNewDisplayName(userData?.displayName || '');
                        setIsDisplayNameEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">USERNAME</label>
                    <p className="text-white text-lg">{userData?.username || 'N/A'}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-0 text-blue-400 hover:text-blue-300"
                      onClick={() => {
                        setNewUsername(userData?.username || '');
                        setIsUsernameEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">EMAIL</label>
                    <p className="text-white text-lg">
                      {userData?.email ? (showEmail ? userData.email : getMaskedEmail(userData.email)) : 'N/A'}
                      {userData?.email && (
                        <Button variant="link" className="px-0 text-blue-400 hover:text-blue-300 ml-2" onClick={() => setShowEmail(!showEmail)}>
                          {showEmail ? 'Hide' : 'Reveal'}
                        </Button>
                      )}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-0 text-blue-400 hover:text-blue-300"
                      onClick={() => {
                        setNewEmail(userData?.email || '');
                        setIsEmailEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">PHONE NUMBER</label>
                    <p className="text-white text-lg">{userData?.phoneNumber || "You haven't added a phone number yet."}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-0 text-blue-400 hover:text-blue-300"
                      onClick={() => {
                        setNewPhoneNumber(userData?.phoneNumber || '');
                        setIsPhoneNumberEditOpen(true);
                      }}
                    >
                      {userData?.phoneNumber ? 'Edit' : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Password and Authentication */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6 w-full">
              <h2 className="text-lg font-bold text-white mb-4">Password and Authentication</h2>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                onClick={() => setIsPasswordChangeOpen(true)}
              >
                Change Password
              </Button>
            </div>

            {/* Sign Out Button */}
            <div className="mt-auto flex justify-end w-full">
              <Button
                variant="link"
                className="px-0 text-red-400 hover:text-red-300"
                onClick={async () => {
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/logout`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]}`,
                      },
                    });
                    if (response.ok) {
                      document.cookie = 'auth_token=; Max-Age=0; path=/'; // Clear the cookie
                      window.location.href = '/login'; // Redirect to login page
                    } else {
                      const errorData = await response.json();
                      toast({
                        title: "Logout Failed",
                        description: errorData.error || "Failed to log out. Please try again.",
                        variant: "destructive",
                      });
                    }
                  } catch (error) {
                    console.error("Logout error:", error);
                    toast({
                      title: "Logout Error",
                      description: "An unexpected error occurred during logout.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        );
      case "profiles":
        return (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">Profiles</h1>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-white" onClick={() => router.back()}>
                  <X className="h-5 w-5" />
                </Button>
            </div>

            {/* User Profile Section for Profiles */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6 relative">
              <div className="absolute top-0 left-0 w-full h-20 bg-blue-800 rounded-t-lg" /> {/* Placeholder for banner */}
              <div className="relative flex items-end -mt-10 mb-4">
                {/* Avatar Placeholder */}
                <div className="w-24 h-24 rounded-full bg-gray-600 border-4 border-gray-900 flex items-center justify-center text-gray-300 text-xs mr-4">
                  {userData?.avatarUrl ? <img src={userData.avatarUrl} alt="User Avatar" className="rounded-full" /> : "Avatar"}
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm">
                  Edit User Profile
                </Button>
              </div>
              <div className="bg-gray-800 rounded-md p-4 mt-4">
                <p className="text-xl font-semibold text-white mb-2">{userData?.displayName || userData?.username}</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">DISPLAY NAME</label>
                    <p className="text-white text-lg">{userData?.displayName || 'N/A'}</p>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400">USERNAME</label>
                    <p className="text-white text-lg">{userData?.username || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-400">This section will contain more detailed profile settings and customization options.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      {/* Left Navigation (240px width) */}
      <div className="w-60 bg-gray-800 flex flex-col p-4 border-r border-gray-900">
        <div className="mb-6">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search"
              className="w-full p-2 pl-8 bg-gray-900 rounded text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {/* Search icon */}
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <p className="text-xs text-gray-400 font-semibold uppercase mb-2">USER SETTINGS</p>
          <Button
            variant="ghost"
            className={`w-full justify-start text-sm ${activeSection === "my-account" ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
            onClick={() => setActiveSection("my-account")}
          >
            My Account
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start text-sm ${activeSection === "profiles" ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
            onClick={() => setActiveSection("profiles")}
          >
            Profiles
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Content & Social</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Data & Privacy</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Family Centre</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Authorised Apps</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Devices</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center">Connections <span className="ml-2 text-[10px] bg-red-500 text-white px-1 py-0.5 rounded">NEW</span></Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Clips</Button>
        </div>

        <div className="mb-6">
          <p className="text-xs text-gray-400 font-semibold uppercase mb-2">PAYMENT SETTINGS</p>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Nitro</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Server Boost</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Subscriptions</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Gift Inventory</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Billing</Button>
        </div>

        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase mb-2">APP SETTINGS</p>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Appearance</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Accessibility</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Voice & Video</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Chat</Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:bg-gray-700 hover:text-white">Notifications</Button>
        </div>
      </div>

      {/* Right Content */} 
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Edit Display Name Dialog */}
      <Dialog open={isDisplayNameEditOpen} onOpenChange={setIsDisplayNameEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Display Name</DialogTitle>
            <DialogDescription>Enter your new display name.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">Display Name</Label>
              <Input
                id="displayName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="col-span-3 bg-gray-700 text-white border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDisplayNameEditOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              onClick={() => handleUpdateUser('displayName', newDisplayName)} 
              disabled={isEditing || !newDisplayName.trim()}
            >
              {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Username Dialog */}
      <Dialog open={isUsernameEditOpen} onOpenChange={setIsUsernameEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Username</DialogTitle>
            <DialogDescription>Enter your new username.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">Username</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="col-span-3 bg-gray-700 text-white border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsUsernameEditOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              onClick={() => handleUpdateUser('username', newUsername)} 
              disabled={isEditing || !newUsername.trim()}
            >
              {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Email Dialog */}
      <Dialog open={isEmailEditOpen} onOpenChange={setIsEmailEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Email</DialogTitle>
            <DialogDescription>Enter your new email address.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="col-span-3 bg-gray-700 text-white border-gray-600"
                type="email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEmailEditOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              onClick={() => handleUpdateUser('email', newEmail)} 
              disabled={isEditing || !newEmail.trim()}
            >
              {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Phone Number Dialog */}
      <Dialog open={isPhoneNumberEditOpen} onOpenChange={setIsPhoneNumberEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{userData?.phoneNumber ? 'Edit' : 'Add'} Phone Number</DialogTitle>
            <DialogDescription>Enter your new phone number.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                className="col-span-3 bg-gray-700 text-white border-gray-600"
                type="tel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPhoneNumberEditOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              onClick={() => handleUpdateUser('phoneNumber', newPhoneNumber)} 
              disabled={isEditing || !newPhoneNumber.trim()}
            >
              {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current and new passwords.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentPassword" className="text-right">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="col-span-3 bg-gray-700 text-white border-gray-600"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPassword" className="text-right">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="col-span-3 bg-gray-700 text-white border-gray-600"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmNewPassword" className="text-right">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="col-span-3 bg-gray-700 text-white border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPasswordChangeOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              onClick={handleChangePassword} 
              disabled={isEditing || !currentPassword || !newPassword || newPassword !== confirmNewPassword}
            >
              {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 