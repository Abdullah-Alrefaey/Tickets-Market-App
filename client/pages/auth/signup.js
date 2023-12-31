import { useState } from 'react';
import Router from 'next/router';
import useRequestHook from '../../hooks/use-request';

const SignUpForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequestHook({
        url: '/api/users/signup',
        method: 'post',
        body: {
            email,
            password,
        },
        onSuccess: () => Router.push('/'),
    });

    const onSubmit = async (event) => {
        event.preventDefault();

        doRequest();
        setEmail('');
        setPassword('');
    };

    return (
        <form onSubmit={onSubmit}>
            <h1>Sign Up Form</h1>
            <div className="form-group">
                <label>Email Address</label>
                <input
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {errors}

            <button className="btn btn-primary">Sign Up</button>
        </form>
    );
};

export default SignUpForm;
