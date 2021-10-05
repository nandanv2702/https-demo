# Generating an SSL Certificate for Development

Here's all the steps I followed to create an SSL certificate for the API. Here's an outline of the same:
1. __Generate a Certificate Authority__ - we import the generated file to Chrome and add it to our Trusted Root Certificates
2. __Create a Private Key__ - this is what we use to "sign" a new certificate signing request
3. __Create a Certificate Signing Request__ - done using the Private Key
4. __Create a Config File__ - sets up DNS stuff for localhost
5. __Generate a Public Certificate__ - signed with Private Key and by Certificate Authority
6. __Forward Secrecy__ - from NodeJS documentation using [Diffie-Hellman key-agreement protocol](https://nodejs.org/api/tls.html#tls_perfect_forward_secrecy)

__IMPORTANT NOTE__: if you're prompted for a `Common Name` in _any_ of the following commands, enter __localhost__

Use Node version 16.10.0
- Check version using `node --version`
- Switch version using `nvm use 16.10.0`
- Install it using `nvm i 16.10.0`). This ensures TLS v1.3 is enforced (better security).

All OpenSSL-related tasks will occur in a folder titled `certs` in this repo. Run the following commands to set it up:
```bash
mkdir certs
cd certs
```

Let's proceed with the steps to generate a Root CA and certificate.

## Generate a Certificate Authority
Step 1: Generate a Private Key

```bash
openssl genrsa -out rootCAKey.pem 4096
```

Step 2: Generate a Self-Signed Root Certificate Authority
```bash
openssl req -x509 -sha256 -new -nodes -key rootCAKey.pem -days 3650 -out rootCACert.pem
```

## Create a Private Key

```bash
openssl genrsa -out server-key.pem 4096
```

## Create a Certificate Signing Request

```bash
openssl req -new -key server-key.pem -out server-csr.pem
```

```bash
touch v3.ext
nano v3.ext
```

## Create a Config File

This file can help "resolve" the DNS to localhost. I was facing the issue before where it said it couldn't verify the 'Common Name' of the certificate. I tried using `127.0.0.1`, `localhost`, `localhost:3001`, `https://localhost:3001`, and so on, however, that didn't resolve it. 

The following solution helps get around that.

This will create a new file `v3.ext` and open a text editor. Add the following contents to the file 
```bash
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
```

Exit the file by clicking `Ctrl X` followed by `y` to save the changes.

You can also add an IP address to `alt_names` in the following way
```bash
IP.1 = 0.0.0.0
```
Using this extensions file, we'll finally generate a public certificate

## Generate a Public Certificate

```bash
openssl x509 -req -in server-csr.pem -CA rootCACert.pem -CAkey rootCAKey.pem -CAcreateserial -out server-cer.pem -days 500 -sha256 -extfile v3.ext
```

### Verify Certificate Contents
```bash
openssl x509 -in server-cer.pem -text -noout
```

## Forward Secrecy

Intense security stuff that's apparently good

```bash
openssl dhparam -outform PEM -out dhparam.pem 2048
```

## Some Helpful Links
- [DigiCert](https://www.digicert.com/kb/ssl-support/openssl-quick-reference-guide.htm)
- [Blog with DNS Workaround](https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/)
- [How to Add Certificate Authority in Chrome](https://ugetfix.com/ask/how-to-fix-this-site-is-not-secure-pop-up-with-an-error-code-dlg_flags_sec_cert_cn_invalid/)
- [Pointing an IP address to Self-Signed Certificate](https://stackoverflow.com/questions/6793174/third-party-signed-ssl-certificate-for-localhost-or-127-0-0-1)
