import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";

const Login = () => {
    const app_name = 'journey-journal-cop4331-71e6a1fdae61';
    const navigate = useNavigate();

    function buildPathAPI(route) {
        if (process.env.NODE_ENV === 'production') {
            return 'https://' + app_name + '.herokuapp.com/' + route;
        } else {
            return 'http://localhost:5001/' + route;
        }
    }

    function buildPath(route) {
        if (process.env.NODE_ENV === 'production') {
            return 'https://' + app_name + '.herokuapp.com/' + route;
        } else {
            return 'http://localhost:3000/' + route;
        }
    }

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const doLogin = async (event) => {
        event.preventDefault();

        var obj = {
            email: email,
            password: password
        };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPathAPI('api/login'), {
                method: 'POST',
                body: js,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            alert('doIt() ' + email + ' ' + password);

            var res = JSON.parse(await response.text());

            if (!res.id) {
                setMessage('User/Password combination incorrect');
            }
            else {
                setMessage(JSON.stringify(res));
                redirectTo('home');
            }

        } catch (e) {
            alert(e.toString());
            return;
        }
    };

    const redirectTo = (route) => {
        const path = buildPath(route);
        window.location.href = path;
    };

    return (
        <div id='login-component'>
            <div id='login-div'>
                <div className='container-sm text-center'>
                    <div className='row justify-content-center'>
                        <div className='col-sm-5'>
                            <img className='img-fluid' src='./brand-logo.png' alt="Brand Logo"></img>
                        </div>
                        <div className='col-sm-5' id='brand-name-div'>
                            <h1 id='brand-name'>JOURNEY <br></br> JOURNAL</h1>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-10 mb-4'>
                            <span id='subtitle'><p className='fs-5'>Enter your email to login.</p></span>
                        </div>
                    </div>
                    <form className='row justify-content-center' id='login-form' onSubmit={doLogin}>
                        <div className='input-group input-group-sm col-sm-12 mb-3'>
                            <input 
                                type="email" 
                                className="form-control" 
                                placeholder="Email Address*" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div className='input-group input-group-sm col-sm-12 mb-3'>
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Password*" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                        <div className='row justify-content-end mb-3'>
                            <div className='col-sm-6 justify-content-end text-end'>
                                <span className="link-opacity-75-hover" id='forgot-pass-redirect'><a href='#' onClick={() => redirectTo('forgot-password')}>Forgot password?</a></span>
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col-sm-12 mb-3'>
                                <button type="submit" className="btn btn-primary" id='login-btn'>Log in</button>
                            </div>
                        </div>
                    </form>
                    <div className='row justify-content-center'>
                        <div className='col-sm'>
                            <span className="link-opacity-75-hover" id='signup-redirect'><p>Don't have an account? </p><a href='#' onClick={() => redirectTo('signup')}>Sign up.</a></span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='my-3' id='loginResult'>
                <span>{message}</span>
            </div>
        </div>
    );
};

export default Login;
