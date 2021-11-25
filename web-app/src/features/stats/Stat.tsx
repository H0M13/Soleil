import { Card, CardContent, Typography } from "@mui/material";

interface Props {
  value: number | string;
  header: string;
};

const Stat = ({value, header}: Props) => {
  return (
    <Card sx={{ 
        margin: '10px 0',
        backgroundColor: 'rgb(27, 116, 242)',
        color: 'white'
      }}
    >
      <CardContent>
        <Typography sx={{ fontSize: 12 }} gutterBottom>
          {header}
        </Typography>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Stat;