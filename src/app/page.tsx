"use client"; // Indica que este é um componente do cliente

import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

export default function Home() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<[string, number][] | null>(null);
  const [selecao, setSelecao] = useState("disk_mtv");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/processar-musicas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto, selecao }),
    });

    const data = await response.json();
    setResultado(data.musicas);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Calculadora de Pontuação de Músicas
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Cole suas músicas no campo abaixo e clique em &quot;Processar&quot;
          para ver as mais pontuadas.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Cole suas músicas aqui..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Selecione o tipo de cálculo</FormLabel>
            <RadioGroup
              row
              value={selecao}
              onChange={(e) => setSelecao(e.target.value)}
            >
              <FormControlLabel
                value="disk_mtv"
                control={<Radio />}
                label="Disk MTV"
              />
              <FormControlLabel value="push" control={<Radio />} label="Push" />
            </RadioGroup>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Processar
          </Button>
        </Box>

        {resultado && (
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Top Músicas Mais Pontuadas
            </Typography>
            <List>
              {resultado.map(([musica, pontos], index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={`${index + 1}. ${musica}`}
                    secondary={`${pontos} pontos`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Paper>
    </Container>
  );
}
