using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Security.Cryptography;
using RSATest.Utility;
using System.Text;

namespace RSATest
{
    public partial class HexTest : System.Web.UI.Page
    {
        private static RSAParameters recentRSAKey;

        protected void Page_Load(object sender, EventArgs e)
        {

            string hexString = Request["EncrytData"];
            if (!String.IsNullOrWhiteSpace(hexString))
            {
                byte[] hexBytes = HexStringToByteArray(hexString);

                byte[] decryptedBytes = MSDNCrypt.RSADecrypt(hexBytes, recentRSAKey, false);

                //string aa = ByteArrayToString(a);
                if (decryptedBytes != null)
                {
                    string decryptedHexString = ByteArrayToHexString(decryptedBytes);

                    string decryptedString = HexToString(decryptedHexString);

                    this.target.Value = decryptedString;
                }

            }

            RSACryptoServiceProvider csp = new RSACryptoServiceProvider(2048);

            RSAParameters rsaKey = csp.ExportParameters(true);
            recentRSAKey = rsaKey;


            this.Modulus.Value = ByteArrayToHexString(rsaKey.Modulus);
            this.Exponent.Value = ByteArrayToHexString(rsaKey.Exponent);

        }

        public byte[] HexStringToByteArray(string hex)
        {
            return Enumerable.Range(0, hex.Length)
                     .Where(x => x % 2 == 0)
                     .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                     .ToArray();
        }

        public static string ByteArrayToHexString(byte[] ba)
        {
            StringBuilder hex = new StringBuilder(ba.Length * 2);
            foreach (byte b in ba)
            {
                hex.AppendFormat("{0:x2}", b);
            }

            return hex.ToString();
        }

        public static string HexToString(string hexString)
        {
            StringBuilder sb = new StringBuilder();
            while (hexString.Length > 0)
            {
                sb.Append(System.Convert.ToChar(System.Convert.ToUInt32(hexString.Substring(0, 2), 16)).ToString());
                hexString = hexString.Substring(2, hexString.Length - 2);
            }
            return sb.ToString();
        }
    }
}