import admin from "firebase-admin"
// import serviceAccount from "./ServiceAccountHomy.json" assert { type: 'json' };
const serviceAccount = {
  "type": "service_account",
  "project_id": "thehomy-d4fb8",
  "private_key_id": "96556e111b2879eda44e9a708c14d8cb7a35dfda",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCwqAStr1Q0Hb8G\nlz0jdyXqLN4YgRYfgSR3Zoabgb9AZquv2AAEwXfBZ+dTVZjr/SWgkmFW0zVbsa/4\nduRcWIQ5aaGK75XUuFSDEXWdneUu1O+R/UEqlfSHf6LWFnZLoOOqS2xCF06ECkZ4\nrA7ZlT5AvC+gyc8h3rlhfDGCReT9ykGpz5ltIqmD9jLLicwVGFYWOUtDqFL03vT+\n7Mkz6heQY0UiSA4db5h7Nktw2blX0q+5pYLhP98YXSAOcWxBrQCvSVZCR8lowScS\n4Ayk0xsVswq7koOA8pshg1Z3dDIaM7ECkYQSWJWJ+09EtfQUKbnmlJ4lXs2/8YCW\nb4/8lTCDAgMBAAECggEAOELKeqZEIvT2SZsRFaJ0qMfxU8yIxy/R9VTpuczwpAoO\n08nu95TGFwqIWboBIedVfHYiGgzaCYHlkTQMNnzaX46MrDrxdPXftH5y/ueyfd/D\nDLOjdXSclCrKKXSt6Bgtaabrq4DQuKytFPF3KUSmtuc4I/Uhyp+sWqe6/MpVy51+\nkHG/fna8ZuLHdsIlcqnEz6RbkjEFwqYMt3fuDRNRPKq4wXsiEz4g9FN/Zlxorhsd\n4QeIENDwqccKx5vjzmVX+qhQTGkDUXhsFQTfwLe/zE+jBM3/FRBKfHfuynmwAxlE\nynSzL9EookT+hUUGfzGgYE+4V0+CUI2FNRMicea0wQKBgQDpchrvI1Bh91QYtBgZ\nbHsZjVFUP5T+GDlM29R1HT4DhauxyH+wed8QlUGXKai8dWzRrMK1Bh2Y29JmpjQt\n0rS2NrHGIqxmU1MKCrBcgWl/vhghfjIabWnfEh7vZ8j3TZv68NkzDq0sMOJJY7va\nHESyiTp+BLX75UQD71nAqySeJwKBgQDBuVImzWywLSuwZTwrfF7vfebxvDGm2MYL\nd4VfT6oJ1l6cU42lMJAvXLoUaiyVh/so9vA7v4yezqYkeYZmoqqAC6xUHPENABeA\ndfkS4ORZ2FkUW+FLgQu7m/if8T7GRRISD9Ze5GncTgoAKPR2WO+IeCNdkFLxct3j\nc9yDNj7wRQKBgGwJbMGjfD36cqcEIesSM1498pek3VVC7LHPQuH4aIzEvhMHEWEg\n5cUM7lAA7aBaT8QxyeJxNB1cDmGHJbrXOt7hLSDfRx4MDfAlxjzpf2OpHA3UE2f7\nnvWnsz1ksLMS7c8Sy9I/RpGfBfqk93kXgAuIStOrZnVvQyz3BniOO+IdAoGBALeK\naXcx8eQJJ/d8MsHQl/G4C3LEpxY5E4oRt19SDvw7CnB6CR2VIUZ+SB7HaW5S43cw\nXvN8zDI5/9dW/CuJupiOdrtKoGd8ysd+/nkQccld3SgY1R/AJ+mcILcIzjzze+d4\n8dX9+v4rQfZc1yC5qlhV2svuzWbNOcUiJK58Wq0xAoGBAOF+DLvhgPdMRnSBri7Q\nOJ1S/qSUGz7L9ZF2Vp/6yrmwj7cRIzELWMArINLfKJK6HCn2k9Kd6aJODg2ZLaS2\n3f++Hoe01hGbcQ87CNNnsbdZILVSXlgermt+pIQhzHAGEUsE0o3grz/Z8hXfutnr\nWp3oKc8tY/Z4A9RET1fKtl5F\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-wavkh@thehomy-d4fb8.iam.gserviceaccount.com",
  "client_id": "104322182615215677133",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wavkh%40thehomy-d4fb8.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://thehomy-d4fb8-default-rtdb.firebaseio.com"
});


export default admin