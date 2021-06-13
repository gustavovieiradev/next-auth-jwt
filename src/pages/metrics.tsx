import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Metric() {

  return (
    <>
      <h1>MÉTRICAS</h1>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');

  console.log(response.data)

  return {
    props: {}
  }
}, {
  permissions: ['metrics.list'],
  roles: [],
})
