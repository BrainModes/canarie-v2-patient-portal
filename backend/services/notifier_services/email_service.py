from models.service_meta_class import MetaService
from config import ConfigClass
import requests
import json
from jinja2 import Template
import os

class SrvEmail(metaclass=MetaService):
    def send(self, title, content, receiver, sender = ConfigClass.EMAIL_DEFAULT_NOTIFIER):
        '''
        (str, str, str, str, str) -> dict   #**TypeContract**
        '''
        url = ConfigClass.EMAIL_SERVICE
        # content = 'Subject: {}\n\n{}'.format(title, content)
        receivers = list()
        receivers.append(receiver)
        payload = {
            "sender": sender,
            "receiver": receivers,
            "message": content,
            "subject": title
        }
        res = requests.post(
            url=url,
            json=payload
        )
        result = json.loads(res.text)
        print(result)
        return json.loads(res.text)

    def send_html(self, template_file, info, subject, receiver, sender = ConfigClass.EMAIL_DEFAULT_NOTIFIER):
        '''
        info: dict object for the variables of the html templates
        receiver: list of email addresses to send the email
        '''
        dirname = os.path.dirname(__file__)
        fname = os.path.join(dirname, 'templates', template_file)
        with open(fname, 'r') as file_:
            template = Template(file_.read())
        content = template.render(info)   
        payload = {
            "sender": sender,
            "receiver": receiver,
            "subject": subject,
            "message": content,
            "msg_type": "html"        
        }
        res = requests.post(
            url=ConfigClass.EMAIL_SERVICE,
            json=payload
        )
        result = json.loads(res.text)
        print(result)
        return json.loads(res.text)


'''
import requests      
from jinja2 import Template
with open('templates/test.html') as file_:
    template = Template(file_.read())

msg = template.render(my_string='AAAAA', my_list=[0,1,2,99,123])     

headers = {
    'Content-Type': 'application/json',
}
data = {"sender":"abc@indocresearch.org",
        "receiver":["sliang@research.baycrest.org"], 
        'subject': 'test email',
        "message":msg,
        "msg_type": "html"
        }
response = requests.post('http://10.3.9.240:5065/v1/email', 
            headers=headers, json=data)
print(response.status_code)  
'''
