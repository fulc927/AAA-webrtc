# AAA Authentication, Authorization, Accounting for WebRTC INFRASTRUCTURE

simple access control lists for SECURITY

Efforts to address security issues of WEBRTC at the server side.

Mechanism to application providers control and limit user access to PaaS resources.

ACL SCHEME let authentication  falls  to  the  application  provider,  and  the 
PaaS  needs  to  deal  only  with  authorization  and accounting

To  implement  accounting,  the  traditional approach is to use call detail records: every time  an  application  creates,  releases,  or  accesses a media  object,  the  platform  records  into  a  database the appId, operation type, and objectId.

extended goal is to get a mainstream API able to access vast computational resources.
