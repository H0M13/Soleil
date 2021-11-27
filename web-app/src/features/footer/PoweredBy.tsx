import { Box, Typography } from "@mui/material"
import chainlink from "./chainlink.png"
import moralis from "./moralis.png"
import ceramic from "./ceramic.png"

export const PoweredBy = () => {
    return <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: (theme) => theme.spacing(1)
        }}
    >
        <Typography>Powered by:</Typography>
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: (theme) => theme.spacing(2),
                height: "50px"
            }}
        >
            <a title="Chainlink" data-blobity-radius="25" href="https://chain.link/"><img alt="chainlink logo" src={chainlink} width="50" height="50" /></a>
            <a title="Moralis" data-blobity-radius="25" href="https://moralis.io/"><img alt="moralis logo" src={moralis} width="50" height="50" /></a>
            <a title="Ceramic" data-blobity-radius="25" href="https://ceramic.network/"><img alt="ceramic logo" src={ceramic} width="50" height="50" /></a>
        </Box>
    </Box>
}