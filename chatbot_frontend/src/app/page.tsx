"use client"; // This is a client component 
import React, { useState } from 'react';
import Image from 'next/image';
import Layout from '@/app/layout';
import { UserButton } from '@clerk/nextjs';

let AskerText: React.FC<{ children: React.ReactNode }>;
AskerText = ({ children }) => {
  return (
    <>
      <div className="text-blue-600 font-semibold list-disc">{children}</div>
    </>
  );
};

let AnswererText: React.FC<{ children: React.ReactNode }>;
AnswererText = ({ children }) => {
  return (
    <>
      <div className="text-black list-disc">{children}</div>
    </>
  );
};

const Home: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inputText }),
      });

      const data = await response.json();
      setResponse(data.answer);
    } catch (error) {
      console.error('Error fetching response:', error);
    }
  };

  return (
    <main>
      <div className={'flex flex-col items-center space-y-4 bg-white'}>
        <Image src={'/golden_bear_logo.png'} alt={''} width={'300'} height={300}></Image>
        <h2 className={'text-4xl text-blue-950 font-bold'}> Need class-taking advice?</h2>
        <form className={'flex flex-col w-1/3'} onSubmit={handleSubmit}>
          <div className="flex-grow bg-gradient-to-b from-white to-black"></div>
          <div className={'flex flex-row border rounded-2xl'}>
            <button className={'px-4'} type="submit">
              Submit
            </button>
            <div className="border-l"></div>
            <input
              className="appearance-none rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight"
              id="username"
              type="text"
              placeholder="Insert text for advice on classes you should take"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        </form>
        <div className={'border rounded-2xl w-3/5 flex flex-col space-x-4 p-4 justify-center'}>
          <div className={'text-xl self-center'}>Previous questions / answers</div>
          {response}
          {/* {response && <AnswererText>{response}</AnswererText>} */}

          {/* Add more responses as needed */}
        </div>
      </div>
    </main>
  );
};

export default Home;
