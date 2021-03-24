import 'regenerator-runtime/runtime'
import React, {useState} from 'react';
import {login, logout} from './utils'
import './App.css';
import * as nearAPI from 'near-api-js'
import ReactJson from 'react-json-view'

import getConfig from './config'

function App() {
    const [signedIn, setSignedIn] = useState(false);
    const [gasAttached, setGasAttached] = useState("100000000000000");
    const [tokensAttached, setTokensAttached] = useState("1000000000000000000000000");
    const [showCallOptions, setShowCallOptions] = useState(false);
    const [request, setRequest] = useState("near view lunanova.pool.f863973.m0 get_accounts '{\"from_index\": 0, \"limit\": 100}'");
    const [response, setResponse] = useState({});

    const _handleKeyDown = function (e) {
        if (e.key === 'Enter') {
            _sendForm()
        }
    }

    const _sendForm = function () {
        const call = request.toLowerCase().split(/('.*?'|".*?"|\S+)/g);

        if (
            !(call[1] || call[3] || call[5]) ||
            call[1] !== 'near' ||
            !['view', 'call'].includes(call[3])) {
            setResponse({error: "Illegal command"});
        } else if (call[3] === 'call' && !signedIn) {
            setResponse({error: "Sign In to send call requests"});
        } else {
            if (!call[9])
                call[9] = "{}";

            let body = {
                contract: call[5],
                method: call[7],
                params: JSON.parse(call[9].replaceAll("'", ""))
            };

            if (call[3] === 'call') {
                body = {
                    ...body,
                    account_id: window.accountId,
                    private_key: window.walletConnection._keyStore.localStorage[`near-api-js:keystore:${window.accountId}:testnet`],
                    //._connectedAccount.walletConnection._authData.allKeys[0],
                    attached_gas: gasAttached,
                    attached_tokens: tokensAttached,
                }
            }
            console.log(window.walletConnection)

            console.log(body)
            console.log(call[3])

            fetch(`http://testnet.api.nearspace.info:5000/${call[3]}`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                }
            })
                .then(res => res.json())
                .then(res => {
                    setResponse(res)
                })
        }

    }

    React.useEffect(
        async () => {
            if (window.walletConnection.isSignedIn()) {
                setSignedIn(true)
            }
        },
        []
    );

    const SignButton = () => {
        return (signedIn ?
                <div>{window.accountId}&nbsp;
                    <button onClick={logout}>Sign out</button>
                </div>
                : <button onClick={login}>Sign in</button>

        )
    }

    const JsonOutput = () => {
        return IsObject(response) ?
            <ReactJson style={{width: "1100px", height: "300px"}}
                       src={response}/>
            : null;
    }

    const IsObject = (obj) => {
        return obj !== undefined && obj !== null && typeof obj == 'object';
    }

    const UpdateQuery = (query) => {
        query = query.toLowerCase();
        setShowCallOptions(query.startsWith("near call"));
        setRequest(query);
    };

    return (
        <div className="App">

            <div style={{position: "absolute", top: 10, right: 10}}>
                <SignButton/>
            </div>

            <div style={{padding: "20px"}}>
                <div>
                    <div>Query</div>
                    <input spellCheck="false" style={{width: "700px"}} type="text" name="query"
                           onKeyDown={_handleKeyDown}
                           defaultValue={request} onChange={e => UpdateQuery(e.target.value)}
                    />
                    <button onClick={_sendForm}>
                        Send
                    </button>
                </div>

                <div className={showCallOptions ? "option-buttons" : "hidden"}>
                    Gas Attached
                    <input spellCheck="false" style={{width: "150px"}} type="text" name="gas"
                           defaultValue={gasAttached} onChange={e => setGasAttached(e.target.value)}
                    />

                    Tokens Attached
                    <input spellCheck="false" style={{width: "200px"}} type="text" name="tokens"
                           defaultValue={tokensAttached} onChange={e => setTokensAttached(e.target.value)}
                    />
                </div>
            </div>


            <div style={{paddingTop: "10px", paddingLeft: "20px"}}>
                <JsonOutput/>
            </div>


        </div>
    );
}

export default App;
