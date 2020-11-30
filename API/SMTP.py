import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText



def sent_mail(mail, Verify_Code):
    content = MIMEMultipart()  #建立MIMEMultipart物件
    content["subject"] = "Swagger Platform Verification"  #郵件標題
    content["from"] = "ntust.fisherman@gmail.com"  #寄件者
    content["to"] = mail #收件者
    content.attach(MIMEText("Your Verify Code is " + Verify_Code))  #郵件內容
    with smtplib.SMTP(host="smtp.gmail.com", port="587") as smtp:  # 設定SMTP伺服器
        try:
            smtp.ehlo()  # 驗證SMTP伺服器
            smtp.starttls()  # 建立加密傳輸
            smtp.login("ntust.fisherman@gmail.com", "jcbqfqdcorzpynjm")  # 登入寄件者gmail
            smtp.send_message(content)  # 寄送郵件
            print("Complete!")
        except Exception as e:
            print("Error message: ", e)


