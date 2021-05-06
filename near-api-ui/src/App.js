import 'regenerator-runtime/runtime'
import React, {useState} from 'react';
import {login, logout} from './utils'
import './App.css';
import * as nearAPI from 'near-api-js'
import ReactJson from 'react-json-view'

import {API_SERVER_URL} from './config'

function App() {
    const [processing, setProcessing] = useState(false);
    const [processedTime, setProcessedTime] = useState(0);
    const [errorFlag, setErrorFlag] = useState(false);
    const [signedIn, setSignedIn] = useState(false);
    const [gasAttached, setGasAttached] = useState("100000000000000");
    const [tokensAttached, setTokensAttached] = useState("1000000000000000000000000");
    const [showCallOptions, setShowCallOptions] = useState(false);
    const [request, setRequest] = useState("near view lunanova.pool.f863973.m0 get_accounts '{\"from_index\": 0, \"limit\": 100}'");
    const [response, setResponse] = useState({});
    const [viewNetworkTestnet, setViewNetworkTestnet] = useState(true);
    const [viewNetworkDisabled, setViewNetworkDisabled] = useState(false);

    const _handleKeyDown = function (e) {
        if (e.key === 'Enter') {
            _sendForm()
        }
    }

    const _sendForm = function () {
        try {

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

                let params;
                try {
                    params = JSON.parse(call[9].replaceAll("'", ""));
                } catch (e) {
                    console.error("Invalid Params");
                    params = "{}";
                }

                let body = {
                    contract: call[5],
                    method: call[7],
                    params: params
                };

                if (call[3] === 'call') {
                    const private_key = window.walletConnection._keyStore.localStorage[`near-api-js:keystore:${window.accountId}:testnet`];
                    if (!private_key) {
                        setResponse({error: "Key wasn't found to sign call request"});
                        return;
                    }

                    body = {
                        ...body,
                        account_id: window.accountId,
                        private_key: private_key,
                        attached_gas: gasAttached,
                        attached_tokens: tokensAttached,
                    }
                } else {
                    if (!viewNetworkTestnet)
                        body = {
                            ...body,
                            rpc_node: "https://rpc.mainnet.near.org"
                        }
                }

                const t0 = performance.now();
                setProcessing(true);

                fetch(`${API_SERVER_URL}/${call[3]}`, {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        if (res.error)
                            setResponse(JSON.parse(res.error));
                        else
                            setResponse(res);

                        setErrorFlag(!!res.error);

                        setProcessedTime(Math.round((performance.now() - t0) / 10) / 100);
                        setProcessing(false)
                    })
            }
        } catch (err) {
            setResponse({error: "Illegal query"});
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

    React.useEffect(() => {
        const timeOutId = setTimeout(() => UpdateQuery(request), 500);
        return () => clearTimeout(timeOutId);
    }, [request]);

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
        const isCall = query.startsWith("near call");
        setShowCallOptions(isCall);
        setViewNetworkDisabled(isCall);
        if(isCall)
            setViewNetworkTestnet(false);
    };

    return (
        <div className="App">

            <div style={{position: "absolute", top: 10, right: 10}}>
                <SignButton/>
            </div>

            <div style={{padding: "20px 0 10px 20px"}}>
                <div>
                    <div style={{display: "block", width: "700px"}}>
                        <div style={{display: "inline-block"}}>Query</div>
                        <div style={{float: "right", display: "inline-block"}}>Network:

                            <input type="checkbox" disabled={viewNetworkDisabled}
                                   checked={viewNetworkTestnet}
                                   onChange={(e) => {
                                       setViewNetworkTestnet(e.target.checked)
                                   }}/>
                            Testnet
                        </div>
                    </div>

                    <div>
                        <input spellCheck="false" style={{width: "700px"}} type="text" name="query"
                               onKeyDown={_handleKeyDown}
                               defaultValue={request} onChange={e => setRequest(e.target.value)}
                        />
                        <button onClick={_sendForm} disabled={processing}>
                            {processing ? "Processing" : "Send"}
                        </button>
                    </div>
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


            <div style={{paddingLeft: "20px"}}>
                {errorFlag
                    ? <div className="error">ERROR!</div>
                    : (processedTime
                        ? <div className="processed">Process time: {processedTime} seconds</div>
                        : null)
                }
                <JsonOutput/>
            </div>


        </div>
    );
}

export default App;
