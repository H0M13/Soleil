import { Container } from "@mui/material";
import Stat from "./Stat";

export const LeftStats = () => {
  return (
    <Container
      sx={{
        height: '100%',
        width: '150px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <Stat header="Total energy generated today" value={55}/>
      <Stat header="Projected DAI distributions for today" value={100}/>
      <Stat header="Projected SLL generation for today" value={65}/>
    </Container>
  );
}

export const RightStats = () => {
  return (
    <Container
      sx={{
        height: '100%',
        width: '150px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Stat header="Total energy generated overall" value={12}/>
      <Stat header="Total overall DAI distributions" value={800}/>
      <Stat header="Total SLL generated" value={19}/>
    </Container>
  );
}
