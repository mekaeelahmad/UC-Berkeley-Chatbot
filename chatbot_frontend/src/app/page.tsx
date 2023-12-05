"use client";
import React, { useState } from 'react';
import Image from 'next/image';

interface QuestionAnswer {
  question: string;
  answer: any;
}

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

export default function Home() {
  const [inputText, setInputText] = useState<string>('');
  const [previousQuestions, setPreviousQuestions] = useState<QuestionAnswer[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: inputText }),
    });

    if (response.ok) {
      const { answer } = await response.json();

      setPreviousQuestions((prevQuestions) => [
        ...prevQuestions,
        { question: inputText, answer },
      ]);

      setInputText('');
    } else {
      console.error('Failed to get a response from the server');
    }
  };

  return (
    <main>
      <div className={'flex flex-col items-center space-y-4 bg-white'}>
        <Image src={"/golden_bear_logo.png"} alt={''} width={"300"} height={300}></Image>
        <h2 className={'text-4xl text-blue-950 font-bold'}> Need class-taking advice?</h2>

        <form className={"flex flex-col w-1/3"} onSubmit={handleSubmit}>
          <div className="flex-grow bg-gradient-to-b from-white to-black"></div>
          <div className={"flex flex-row border rounded-2xl"}>
            <button className={"px-4"} type="submit">
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

        <div className={"border rounded-2xl w-3/5 flex flex-col space-x-4 p-4 justify-center"}>
          <div className={"text-xl self-center"}>Previous questions / answers</div>

          <AskerText>Should i take CS61A</AskerText>
          <AnswererText>CS61A is a foundational computer science course at the University of California, Berkeley. It covers fundamental concepts in computer science and programming using the Python programming language. If you are a computer science major at Berkeley or a similar institution where CS61A is a recommended or required course, then it is highly advisable to take it.</AnswererText>

          <AskerText>Which class should I take before  CS162 at Berkeley</AskerText>
          <AnswererText>Before taking CS162, it's typically recommended that students have a solid understanding of foundational computer science and programming concepts. Here are some prerequisite courses that are often suggested:
            <ul className={"list-disc"}>
              <li>CS61B - Data Structures: CS61B is the second course in the introductory computer science series at Berkeley. It covers fundamental data structures and algorithms. A strong understanding of data structures is crucial for systems programming, which is a significant part of CS162.</li>

              <li>CS61C - Machine Structures: CS61C is the third course in the introductory computer science series at Berkeley. It covers computer architecture and organization. This course is particularly relevant for understanding the hardware-software interface, which is important for systems programming.</li>

              <li>CS70 - Discrete Mathematics and Probability Theory: This course provides a mathematical foundation for computer science and covers topics such as logic, proof techniques, discrete structures, and probability. Understanding these concepts is valuable for many areas of computer science, including operating systems.</li>
            </ul>
          </AnswererText>

          {previousQuestions.map((qa, index) => (
            <React.Fragment key={index}>
              <AskerText>{qa.question}</AskerText>
              <AnswererText>{qa.answer}</AnswererText>
            </React.Fragment>
          ))}
        </div>
      </div>
    </main>
  );
}
