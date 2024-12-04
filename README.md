# TECHLANZ
 FileUploadService

FOR UPLOAD 
USE  Request Type -POST 
     URL-  http://localhost:3000/api/files/upload
     Body-  use form-data  with key= file and select file to upload

FOR DOWNLOAD
USE  Request Type -GET
     URL-  http://localhost:3000/api/files/:id
     instead of id use actual id of uploaded file

FOR DELETE
USE  Request Type - DELETE
     URL- http://localhost:3000/api/files/id
     instead of id use actual id of uploaded file
