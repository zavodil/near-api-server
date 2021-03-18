import React, {useState} from 'react';
import './App.css';
import ReactJson from 'react-json-view'

function App() {
    const [request, setRequest] = useState("near view lunanova.pool.f863973.m0 get_accounts '{\"from_index\": 0, \"limit\": 100}'");
    const [response, setResponse] = useState({});

    const _handleKeyDown = function (e) {
        if (e.key === 'Enter') {
            _sendForm()
        }
    }

    const _sendForm = function () {
        const call = request.toLowerCase().split(/('.*?'|".*?"|\S+)/g);

        if (call[1] !== 'near' || call[3] !== 'view') {
            setResponse("Illegal command");
        } else {
            fetch('http://testnet.api.nearspace.info:5000/view', {
                method: 'POST',
                body: JSON.stringify({
                    contract: call[5],
                    method: call[7],
                    params: JSON.parse(call[9].replaceAll("'", ""))
                }),
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

    return (
        <div className="App">

            <div style={{padding: "20px"}}>
                <input spellCheck="false" style={{width: "700px"}} type="text" name="query" onKeyDown={_handleKeyDown}
                       value={request} onChange={e => setRequest(e.target.value)}
                />
                <button onClick={_sendForm}>
                    Send
                </button>
            </div>

            <div style={{paddingTop: "10px", paddingLeft: "20px"}}>
                <ReactJson style={{width: "1100px", height: "300px"}}
                           src={response}/>
            </div>


        </div>
    );
}

export default App;
