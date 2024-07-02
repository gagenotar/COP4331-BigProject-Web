import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./SignUp.css";

const SignUp = () => {

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
    
    const [signUpFirstName, setSignUpFirstName] = useState('');
    const [signUpLastName, setSignUpLastName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpLogin, setSignUpLogin] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [message,setMessage] = useState('');


  const doSignUp = async event => 
    {
        event.preventDefault();

        var obj = 
        {
            firstName: signUpFirstName,
            lastName: signUpLastName,
            email: signUpEmail,
            login: signUpLogin,
            password: signUpPassword
        };
        var js = JSON.stringify(obj);

        try
        {
            const response = await fetch((buildPathAPI('api/register')),
                {
                    method: 'POST',
                    body: js,
                    headers: 
                    {
                        'Content-Type': 'application/json'
                    }
                }
            );

            alert('doIt() ' + signUpLogin.value + ' ' + signUpPassword.value );

            // TODO: Enforce unique usernames
            
            var res = JSON.parse(await response.text());

            setMessage(JSON.stringify(res));

            redirectTo('email-verification');
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }
    };

    const redirectTo = (route) => {
        const path = buildPath(route);
        window.location.href = path;
    };

  return (
    <div id='signup-component'>
        <div id='register-div'>
            <div className='container-sm text-center'>
                <div className='row justify-content-center'>
                    <div className='col-sm-5'>
                        <img className='img-fluid' src='./brand-logo.png'></img>
                    </div>
                    <div className='col-sm-5' id='brand-name-div'>
                        <h1 id='brand-name'>JOURNEY <br></br> JOURNAL</h1>
                    </div>
                </div>
                <div className='row justify-content-center'>
                    <div className='col-sm-10 mb-4'>
                        <span id='subtitle'><p className='fs-5'>Sign up to post your adventures and share with friends.</p></span>
                    </div>
                </div>
                <form className='row justify-content-center' id='register-form' onSubmit={doSignUp}>
                    <div className='input-group input-group-sm col-sm-12 mb-3'>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="First Name" 
                            value={signUpFirstName}
                            onChange={(e) => setSignUpFirstName(e.target.value)}
                            maxlength="30"
                        />
                    </div>
                    <div className='input-group input-group-sm col-sm-12 mb-3'>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Last Name" 
                            value={signUpLastName}
                            onChange={(e) => setSignUpLastName(e.target.value)}
                            maxlength="30"
                        />
                    </div>
                    <div className='input-group input-group-sm col-sm-12 mb-3'>
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="Email Address*" 
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            maxlength="30"
                            required 
                            pattern="[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[a-z]" 
                            title="username@email.com"
                        />
                    </div>
                    <div className='input-group input-group-sm col-sm-12 mb-3'>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Username*" 
                            value={signUpLogin}
                            onChange={(e) => setSignUpLogin(e.target.value)}
                            maxlength="30"
                            required
                            pattern=".{4,}" 
                            title="Username must be at least 4 characters"
                        />
                    </div>
                    <div className='input-group input-group-sm col-sm-12 mb-3'>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="Password*" 
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            maxlength="30"
                            required 
                            pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}" 
                            title="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special symbol (!@#$%^&*)"
                        />
                    </div>
                    <div className='col-sm-12 mb-3'>
                        <button type="submit" class="btn btn-primary">Sign Up</button>
                    </div>
                </form>
                <div className='row justify-content-center'>
                    <div className='col-sm'>
                        <span class="link-opacity-75-hover" id='login-redirect'><p>Have an account? </p><a href='#' onClick={() => redirectTo('')}>Log in.</a></span>
                    </div>
                </div>
            </div>
        </div>
        <span id="signUpResult">{message}</span>
    </div>
  );
};

export default SignUp