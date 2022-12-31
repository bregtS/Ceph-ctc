import React, {useEffect, useState} from 'react';
import useWindowDimensions from "../hooks/useWindowDimensions";
import axios from "axios";
import {useOidcIdToken, useOidcUser} from "@axa-fr/react-oidc";

const SreeIframe = () => {
    const [iframeSrc, setIframeUrl] = useState('http://127.0.0.1:5555/config.html');
    const { height, width } = useWindowDimensions();
    const{ idToken, idTokenPayload } = useOidcIdToken();

    const loadFrame = (payload) => {

        const iframe = document.querySelector("iframe");
        iframe.contentWindow.postMessage(payload, "*");
        setIframeUrl('http://127.0.0.1:5555')
    }
    const fetchdata = async () => {
        let payload = {
            region: "us-east-1",
            acl: "public-read",
        }
        //Fetch Endpoint
        try {
            const responseUri = await axios.get('http://localhost:81/endpoint');
            payload.endpoint = responseUri.data;
        } catch (error) {
            console.error(error);
        }

        //Fetch Access Keys
        try {
            const responseUser = await axios.get(`http://localhost:81/user/${idTokenPayload.email}`);
            payload.accessKeyId = responseUser.data.keys[0].access_key;
            payload.secretKeyId = responseUser.data.keys[0].secret_key;
        } catch (error) {

            //Create User if not exists
            try {
                const createUserResp = await axios.post('http://localhost:81/user', {
                    "uid": idTokenPayload.email,
                    "display_name": idTokenPayload.email,
                    "email": idTokenPayload.email,
                    "user_caps": "usage=read, write; users=read",
                    "max_buckets": 1000
                });
                payload.accessKeyId = createUserResp.data.keys[0].access_key;
                payload.secretKeyId = createUserResp.data.keys[0].secret_key;

            } catch (error) {
                console.error(error);
            }
        }
        console.log(payload);
        loadFrame(payload);
    }
    useEffect(() => {
        fetchdata();
    }, [])

    return (
        <div>
            <iframe src={iframeSrc} height={height * 0.9} width={width * 0.98} style={{border: "1px solid black", marginLeft: `${width * 0.004}px`}} title="Iframe"></iframe>
        </div>
    );
};

export default SreeIframe;
/*
 /*const payload = {
            endpoint: "http://172.24.163.163:8000",
            region: "us-east-1",
            accessKeyId: "YH2BUHU3Q6HQVW0QH30T",
            secretKeyId: "gt5c2t3TCd6i9fQQwGeHxpZ6Y3ROy8cH6ulqutNu",
            acl: "public-read",
        }*/