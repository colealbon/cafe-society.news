import {
  Show,
  Accessor,
  Setter,
  createEffect
} from 'solid-js'
import {
  Separator
} from "@kobalte/core"
import {
  useSearchParams
} from '@solidjs/router'
import {Button} from './components/Button';

async function generateCodeChallenge(codeVerifier: string) {
  var digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function generateRandomString(length: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

const Profile = (props: {
  albyCodeVerifier: Accessor<string>
  setAlbyCodeVerifier: Setter<string>
  albyCode: Accessor<string>
  setAlbyCode: Setter<string>
  albyTokenReadInvoice: Accessor<string>
  setAlbyTokenReadInvoice: Setter<string>
}) => {

  const authorizeEndpoint = "https://getalby.com/oauth";
  const tokenEndpoint = "https://api.getalby.com/oauth/token";
  const clientId = import.meta.env.VITE_ALBY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_ALBY_CLIENT_SECRET
  const scopes = "invoices:read"

  createEffect(() => {
    if (useSearchParams()[0]?.code == null) {
      props.setAlbyCode('')
      return
    }
    props.setAlbyCode(`${useSearchParams()[0]?.code}`)
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var response = xhr.response;
      if (xhr.status == 200) {
        props.setAlbyTokenReadInvoice(response.access_token)
      }
    };
    xhr.responseType = 'json';
    xhr.open("POST", tokenEndpoint, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader("Authorization", "Basic " + btoa(clientId + ":" + clientSecret))
    xhr.send(new URLSearchParams({
      code_verifier: props.albyCodeVerifier(),
      grant_type: "authorization_code",
      redirect_uri: `https://${window.location.hostname}/alby`,
      code: `${useSearchParams()[0]?.code}`
    }));
  })

  const authenticateAlby = () => {
    const codeVerifier = generateRandomString(64);
    generateCodeChallenge(codeVerifier)
    .then((codeChallenge: string) => {
      props.setAlbyCodeVerifier(codeVerifier);
      const redirectUri = `https://${window.location.hostname}/alby`
      const args = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: scopes,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        redirect_uri: redirectUri
    });
    window.location = `${authorizeEndpoint}/?${args}` as unknown as Location
  })
  }

  return (
    <div>
      <h1>
        Profile
      </h1>
      <Separator.Root />
      <Show
        when={props.albyTokenReadInvoice() != ''}
        fallback={
          <div>
            <div>{props.albyTokenReadInvoice()}</div>
            <Button 
              onClick={() => authenticateAlby()}
              label='login alby'
            />
          </div>
          }
      >
        <div class='fade-in'>
          <Button 
            label='logout alby'
            onClick={() =>{
              props.setAlbyTokenReadInvoice('')
              props.setAlbyCode('')
              props.setAlbyCodeVerifier('')
            }}
          />
        </div>
      </Show>

    </div>
  );
};

export default Profile;