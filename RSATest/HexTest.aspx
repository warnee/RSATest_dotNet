<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="HexTest.aspx.cs" Inherits="RSATest.HexTest" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>

    <script type="text/javascript" src="Scripts/bs/rsa.js"></script>

    <script type="text/javascript">
        function Encryt() {
            var modulus = document.getElementById("Modulus").value;
            var exponent = document.getElementById("Exponent").value;
            var source = document.getElementById("source").value;

            var encrytedString = bsrsa(modulus, exponent, source);

            document.getElementById("EncrytData").value = encrytedString;
        }
    </script>


</head>
<body>
    <form id="form1" runat="server">
    <div>
        서버에서 넘겨준 공개키 정보<br/>
        Modulus : <input type="text" id="Modulus" runat="Server" ><br/>
        Exponent : <input type="text" id="Exponent" runat="Server"><br/>
        <br/>
        Source : <input type="text" id="source" name="source" /><input type="button" onclick="Encryt();" value="Encryt" /><br />
        Encrypted : <input type="text" id="EncrytData" name="EncrytData" readonly="readonly" /><input type="button" onclick="submit();" value="Decryt" /><br />
        Decrypted : <input type="text" id="target" runat="Server" readonly="readonly" />
    </div>
    </form>
</body>
</html>
