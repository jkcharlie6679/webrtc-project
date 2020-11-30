import random

def generate_verification_code(len):

    code_list = [] 
    for i in range(10): # 0-9數字
        code_list.append(str(i))
    for i in range(65, 91): # 對應從“A”到“Z”的ASCII碼
        code_list.append(chr(i))
    for i in range(97, 123): #對應從“a”到“z”的ASCII碼
        code_list.append(chr(i))
    myslice = random.sample(code_list, 6) # 從list中隨機獲取6個元素，作為一個片斷返回
    verification_code = ''.join(myslice) # list to string

    return verification_code