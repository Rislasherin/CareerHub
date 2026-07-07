const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: '6a30c93fc481a7dddde4a21c', role: 'student' }, 'access_super_secret_key_123', { expiresIn: '1h' });

async function test() {
  try {
    const formData = new FormData();
    const pdfBlob = new Blob(['dummy pdf content'], { type: 'application/pdf' });
    formData.append('resume', pdfBlob, 'resume.pdf');
    
    const res = await fetch('http://localhost:5000/api/student/profile/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', data);
  } catch(e) {
    console.error(e);
  }
}
test();
