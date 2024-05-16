import {
  Show,
  Accessor,
  Setter,
  createEffect,
  createSignal,
} from 'solid-js'
import {
  useSearchParams
} from '@solidjs/router'
import { FaSolidCheck  as CheckIcon} from 'solid-icons/fa'
import {
  Combobox,
  createFilter,
  Separator
} from "@kobalte/core";
import {Button} from './components/Button';
import { PageHeader } from './components/PageHeader'
import { NostrKey } from './NostrKeys'
import * as nip19 from 'nostr-tools/nip19'

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
  nPubOptions: NostrKey[],
  setProcessedPostsRoomId: Setter<string>
  processedPostsRoomId: Accessor<string>
}) => {

  const authorizeEndpoint = "https://getalby.com/oauth";
  const tokenEndpoint = "https://api.getalby.com/oauth/token";
  const clientId = import.meta.env.VITE_ALBY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_ALBY_CLIENT_SECRET
  const scopes = "invoices:read"
  const filter = createFilter({ sensitivity: "base" });
  const [optionsNpub, setOptionsNpub] = createSignal<string[]>();
  // const [npubValue, setNpubValue] = createSignal('');
  const onOpenChangeNpub = (isOpen: boolean, triggerMode?: Combobox.ComboboxTriggerMode) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    if (isOpen && triggerMode === "manual") {
      setOptionsNpub(props.nPubOptions.map(nPubOption => nPubOption.publicKey))
    }
  };
  const onInputChangeNpub = (value: string) => {
    setOptionsNpub(optionsNpub()?.filter(option => !filter.contains(option, value)));
  };

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
      <PageHeader>
        Profile
      </PageHeader>
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
      <Separator.Root />
    
      <Combobox.Root<string>
        multiple={false}
        options={props.nPubOptions.map((nostrKey => nostrKey.publicKey ? nip19.npubEncode(nostrKey.publicKey): ''))}
        value={props.processedPostsRoomId()}
        onChange={(theValue) => {
          console.log(theValue)
          props.setProcessedPostsRoomId(theValue)
        }}
        // onInputChange={onInputChangeNpub}
        // onOpenChange={onOpenChangeNpub}
        placeholder="click label to remove..."
        itemComponent={props => (
          <Combobox.Item item={props.item} class='combobox__item w-200px'>
            <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
            <Combobox.ItemIndicator class="combobox__item-indicator">
              <CheckIcon />
            </Combobox.ItemIndicator>
          </Combobox.Item>
        )}
      >
        <Combobox.Control<string> 
          aria-label="nPub"
          class="bg-white combobox__control" 
        >
        {state => (
          <> 
            <Combobox.Trigger class='border-none bg-transparent align-middle text-3xl transition-all hover-text-white hover:bg-black rounded-full'>
            sync&nbsp;
            </Combobox.Trigger>
            <div class='flex flex-row bg-white '>
              <For each={state.selectedOptions()}>
                {option => (
                  <div class='align-bottom flex flex-row' onPointerDown={e => e.stopPropagation()}>
                    <Button
                      title={`remove ${option}`}
                      onClick={() => {
                        state.remove(option)
                      }}
                      label={option}
                    />
                  </div>
                )}
              </For>
            </div>
          </>
        )}
      </Combobox.Control>
      <Combobox.Portal>
        <Combobox.Content class="combobox__content">
          <Combobox.Listbox class="combobox__listbox font-sans"/>
        </Combobox.Content>
      </Combobox.Portal>
      </Combobox.Root>

    </div>
  );
};

export default Profile;