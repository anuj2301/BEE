// Self-signed certificate generator for development
// For production, use Let's Encrypt or AWS Certificate Manager
// This version uses Node.js built-in modules - no OpenSSL required!

const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'certs');

// Ensure certs directory exists
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

console.log('Generating self-signed SSL certificate for development...');
console.log('Note: This is for local testing only. For production, use Let\'s Encrypt or AWS ACM.\n');

try {
  // Generate a key pair
  console.log('Generating RSA key pair...');
  const keys = forge.pki.rsa.generateKeyPair(2048);
  
  // Create a certificate
  console.log('Creating certificate...');
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  // Set certificate attributes
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'US' },
    { shortName: 'ST', value: 'State' },
    { name: 'localityName', value: 'City' },
    { name: 'organizationName', value: 'LinkShort Dev' },
    { shortName: 'OU', value: 'Development' }
  ];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  
  // Add extensions
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 2, value: '*.localhost' },
        { type: 7, ip: '127.0.0.1' },
        { type: 7, ip: '::1' }
      ]
    }
  ]);
  
  // Self-sign certificate
  cert.sign(keys.privateKey, forge.md.sha256.create());
  
  // Convert to PEM format
  const pemCert = forge.pki.certificateToPem(cert);
  const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
  
  // Save to files
  const certPath = path.join(certsDir, 'localhost.pem');
  const keyPath = path.join(certsDir, 'localhost-key.pem');
  
  fs.writeFileSync(certPath, pemCert);
  fs.writeFileSync(keyPath, pemKey);
  
  console.log('\n✓ SSL certificates generated successfully!');
  console.log('  Certificate: certs/localhost.pem');
  console.log('  Private Key: certs/localhost-key.pem');
  console.log('  Valid for: 1 year');
  console.log('\n📝 Next steps:');
  console.log('  1. Update your .env file:');
  console.log('     ENABLE_HTTPS=true');
  console.log('     HTTPS_PORT=3443');
  console.log('  2. Start the server: npm start');
  console.log('  3. Visit: https://localhost:3443');
  console.log('\n⚠️  Note: Your browser will show a security warning.');
  console.log('   Click "Advanced" and "Proceed to localhost (unsafe)" to continue.');
  console.log('\n💡 For trusted local certificates (no warnings), use mkcert:');
  console.log('   Windows: choco install mkcert');
  console.log('   Then run: mkcert -install && mkcert localhost 127.0.0.1 ::1\n');
  
} catch (error) {
  console.error('\n✗ Error generating certificates:', error.message);
  console.error(error.stack);
  process.exit(1);
}
