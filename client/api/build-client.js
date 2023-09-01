import axios from 'axios';

const buildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // we are in server env
        return axios.create({
            baseURL:
                'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers,
        });
    } else {
        // we are in browser
        // baseURL: '/' by default
        return axios.create({
            baseURL: '/',
        });
    }
};

export default buildClient;
