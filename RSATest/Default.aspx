<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeBehind="Default.aspx.cs" Inherits="RSATest._Default" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>
<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <h2>
        Welcome to RSA Test Page
    </h2>
    <p>
        RSA Test with Hex <a href="HexTest.aspx">RSA Test with Hex</a>
    </p>
    <p>
        RSA Test with Base64 <a href="Base64Test.aspx">RSA Test with Base64</a>
    </p>
</asp:Content>
