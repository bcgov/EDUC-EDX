import { UserRecord } from './csvParser';
import axios from 'axios';

async function getChesToken() {
  const response = await axios.post<{access_token: string}>(process.env.CHES_TOKEN_URL,
    new URLSearchParams({
      client_id: process.env.CHES_CLIENT_ID,
      client_secret: process.env.CHES_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  );
  return response.data.access_token;
}

export function makeMessage(record: UserRecord, instituteDetails: {
  displayName: string,
  primaryCode: string
}) {
  return `<p>Hi ${record.firstName} ${record.lastName},<p>`

    + `<p>Here is the Primary Access Code for the Education Data Exchange (EDX) for ${record.mincode} - `
    + `${instituteDetails.displayName}: ${instituteDetails.primaryCode}</p>`

    + '<p>Please keep this code safe. It will be required for the activation of each EDX account at your school. Once'
    + ' you have activated your EDX Admin Account, you will be able to view the Primary Access Code through the EDX'
    + ' User Management screen - available under the "Administration" menu option.</p>'

    + '<p>Regards,<br/>'
    + 'The Ministry of Education and Child Care\'s EDX Team</p>';
}

export async function sendMail(envelope: {to: string; message: string}) {
  const token = await getChesToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  return axios.post(process.env.CHES_EMAIL_URL, {
    from: 'noreply-edx@gov.bc.ca',
    to: [envelope.to],
    priority: 'normal',
    subject: 'Primary Access Code for Education Data Exchange',
    encoding: 'utf-8',
    bodyType: 'html',
    body: envelope.message
  }, { headers });
}
