import { FormEvent, useState } from 'react'
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Home.module.css'
import { withSSRGuest } from '../utils/withSSRGuest';

export default function SignIn() {
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

export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {}
  }
})
