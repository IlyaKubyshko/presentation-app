import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async () => {
    try {
      const { data } = await axios.post(
       'http://localhost:5000/api/login',
       { nickname, password },
     );                      // data = { token, nickname }
     localStorage.setItem('token', data.token);
     localStorage.setItem('user', data.nickname);
     nav('/home');
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Помилка');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700/40">
      <div className="bg-white w-[420px] p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center">SlideSmith</h1>
        <h2 className="text-xl font-semibold mb-6 text-center">Авторизація</h2>

        {err && <p className="text-red-600 mb-3">{err}</p>}

        <input
          type="text"
          placeholder="Нікнейм"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          className="w-full border px-4 py-3 rounded-lg mb-4"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border px-4 py-3 rounded-lg mb-6"
        />

        <button
          disabled={!nickname || !password}
          onClick={submit}
          className={`w-full py-3 rounded-lg text-white text-lg ${
            nickname && password
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-green-300 cursor-not-allowed'
          }`}
        >
          Увійти
        </button>

        <p className="text-center mt-4">
          Немає акаунта?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Реєстрація
          </Link>
        </p>
      </div>
    </div>
  );
}
