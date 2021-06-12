import { FormEvent, useState } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import styles from '../styles/Home.module.css'

export default function Home() {
  // estagiario@rocketseat.team
  const [email, setEmail] = useState<string>('diego@rocketseat.team');
  const [password, setPassword] = useState<string>('123456');

  const { signIn } = useAuth();

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    await signIn({email, password});
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit} noValidate>
      <input type="email" value={email} onChange={ev => setEmail(ev.target.value)} />
      <input type="password" value={password} onChange={ev => setPassword(ev.target.value)} />
      <button type="submit">Entrar</button>
    </form>
  )
}
