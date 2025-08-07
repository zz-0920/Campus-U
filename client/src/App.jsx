import WrapperRouter from './routers/index.jsx'
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <WrapperRouter />
      <Toaster />
    </>
  )
}