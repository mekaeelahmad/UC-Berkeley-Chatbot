// Import necessary Clerk.js components and hooks
"use client"
import { SignInButton, useUser } from '@clerk/nextjs';

// Your existing imports...
import React, { useState } from 'react';
import Image from 'next/image';
import Layout from '@/app/layout';
import { UserButton, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

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

  // Use the useUser hook from Clerk.js
  const { user } = useUser();
  const isSignedIn = !!user;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log('Submitting request...');
      const response = await fetch('/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inputText }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response:', data);
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

        {/* Render SignInButton conditionally if not signed in */}
        {!isSignedIn && (
          <div>
            <SignInButton />
          </div>
        )}

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
          {response && <AnswererText>{response}</AnswererText>}

          {/* Add more responses as needed */}
          User: Tell me about cs61a. <br/>
          Bot:  The UC Berkeley course CS61A: Structure and Interpretation of Computer Programs is a comprehensive introduction to the fundamental concepts of computer science. It covers modern topics such as object-oriented programming, higher-order programming, continuations, tree recursion, stream processing, debugging techniques, and resource management algorithms. It emphasizes the importance of understanding the structures that underlie computation. Emphasis is on problem solving, design, and programming. Information about the course and syllabus can be found here: https://inst.eecs.berkeley.edu/~cs61a/fa20/.
          <br/><br/>
          User: What should I take my first semester?<br />
          Bot: The best way to answer this question is to reach out to a faculty advisor at UC Berkeley. Advisors in the College of Letters & Science, the Undergraduate Division of the College of Letters & Science, and other Colleges at UC Berkeley have extensive knowledge of the courses offered and could help you determine which classes could be the most beneficial for you.

          The College of Letters & Science provides advising services for most majors, and its advisors can be reached via their website:
          https://advising.ls.berkeley.edu/

          In addition, the Undergraduate Division can point you in the direction of the right advisors for each college, and provide additional advice and resources:
          http://ugrad.berkeley.edu/
        </div>
      </div>
    </main>
  );
};

export default Home;
