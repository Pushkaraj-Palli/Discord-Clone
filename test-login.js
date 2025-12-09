// Test script to verify login functionality
const testLogin = async () => {
  const baseUrl = 'https://discord-clone-app-wcfo.onrender.com';
  
  console.log('Testing login functionality...');
  console.log('Base URL:', baseUrl);
  
  try {
    const response = await fetch(`${baseUrl}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'luffy@gmail.com',
        password: '123456'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login successful!');
      console.log('User:', data.user);
      console.log('Token received:', !!data.token);
    } else {
      const errorData = await response.json();
      console.log('Login failed:', errorData);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testLogin();