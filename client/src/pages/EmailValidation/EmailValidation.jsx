import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCircleArrowLeft } from 'react-icons/fa6';
import TEST_ID from './EmailValidation.testid';
import { UserContext } from '../../context/UserContext';
import useFetch from '../../hooks/useFetch';

// styles
const styles = {
  CONTAINER:
    'flex flex-col justify-center items-center h-screen p-4 gap-y-16 bg-organizerGray-light',
  INPUT:
    'text-center border-2 border-organizerPurple-accentLight p-2 rounded w-full max-w-md focus:outline-organizerPurple-primary',
  PARAGRAPH: 'text-lg text-center text-organizerPurple-dark mb-4',
  CHECKING_EMAIL: 'text-organizerPurple-primary text-sm mt-2',
};

// component
const EmailValidation = () => {
  const navigate = useNavigate();
  const { setEmailAfterValidation } = useContext(UserContext);

  const [email, setEmail] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);

  const validateEmail = (email) => {
    const re =
      /^[-!#$%&'*+/=?^_`{|}~A-Za-z0-9]+(?:\.[-!#$%&'*+/=?^_`{|}~A-Za-z0-9]+)*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]$/;
    return re.test(email);
  };

  // Give some time to the user before redirecting to the login or sign up page
  let timeoutId;
  const handleTypingStop = () => {
    if (validateEmail(email)) {
      setCheckingEmail(true);
      timeoutId = setTimeout(() => {
        performFetch();
      }, 3000);
    }
  };
  const handleTyping = () => {
    clearTimeout(timeoutId);
  };

  const { performFetch, cancelFetch } = useFetch(
    `/user/checkemail/${email}`,
    (response) => {
      setCheckingEmail(false);
      setEmailAfterValidation(email);
      response.exists
        ? navigate('/../user/login')
        : navigate('/../user/signup');
    }
  );

  useEffect(() => {
    handleTypingStop();
    handleTyping();

    if (validateEmail(email)) {
      handleTypingStop();
    }

    return () => {
      clearTimeout(timeoutId);
      cancelFetch();
    };
  }, [email]);

  return (
    <div data-testid={TEST_ID.container} className={styles.CONTAINER}>
      <p className={styles.PARAGRAPH}>
        Let’s check what you are going to do today!
      </p>
      <input
        className={styles.INPUT}
        data-testid={TEST_ID.emailInput}
        placeholder="Enter your email"
        type="email"
        value={email}
        onChange={(e) => {
          const email = e.target.value;
          setEmail(email);
        }}
        onKeyUp={handleTypingStop}
        onKeyDown={handleTyping}
      />
      {
        // go back to the welcome page
        !checkingEmail && (
          <Link
            to="/../welcome"
            className="text-organizerPurple-primary self-start text-sm flex items-center gap-x-1"
          >
            <FaCircleArrowLeft /> Go back
          </Link>
        )
      }
      {checkingEmail && (
        <div className={styles.CHECKING_EMAIL}>Checking email...</div>
      )}
    </div>
  );
};

export default EmailValidation;
