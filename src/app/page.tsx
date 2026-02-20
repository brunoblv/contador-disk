"use client"; // Indica que este é um componente do cliente

import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Slide,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  MusicNote,
  TrendingUp,
  PlayArrow,
  Star,
  EmojiEvents,
  ContentCopy,
} from "@mui/icons-material";

export default function Home() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<[string, number][] | null>(null);
  const [selecao, setSelecao] = useState("disk_mtv");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/processar-musicas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, selecao }),
      });

      const data = await response.json();
      setResultado(data.musicas);
    } catch (error) {
      console.error("Erro ao processar:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPoints = () => {
    if (!resultado || resultado.length === 0) return 0;
    // Soma os pontos das primeiras 30 músicas (top 30)
    const top30 = resultado.slice(0, 30);
    return top30.reduce((total, [, pontos]) => total + pontos, 0);
  };

  const getRankColor = (index: number) => {
    if (index === 0) return theme.palette.warning.main;
    if (index === 1) return theme.palette.grey[400];
    if (index === 2) return theme.palette.warning.dark;
    return theme.palette.primary.main;
  };

  const formatTableForCopy = () => {
    if (!resultado || resultado.length === 0) return "";

    const totalPoints = getTotalPoints();

    return resultado
      .map(([musica, pontos], index) => {
        const percentage = totalPoints > 0 ? (pontos / totalPoints) * 100 : 0;
        return `#${
          index + 1
        }. ${musica} - ${pontos} Pontos - ${percentage.toFixed(2)}%`;
      })
      .join("\n");
  };

  const handleCopyTable = async () => {
    try {
      const formattedText = formatTableForCopy();
      await navigator.clipboard.writeText(formattedText);
      setSnackbarMessage("Tabela copiada com sucesso!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      setSnackbarMessage("Erro ao copiar a tabela");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            <MusicNote sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Calculadora de Pontuação
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Descubra suas músicas mais pontuadas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cole suas músicas e veja o ranking completo com pontuações
          </Typography>
        </Box>

        {/* Form Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            mb: 4,
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Cole suas músicas aqui... Uma por linha"
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                Tipo de Cálculo
              </FormLabel>
              <RadioGroup
                row
                value={selecao}
                onChange={(e) => setSelecao(e.target.value)}
                sx={{
                  "& .MuiFormControlLabel-root": {
                    mr: 3,
                    mb: 1,
                  },
                  flexWrap: "wrap",
                }}
              >
                <FormControlLabel
                  value="disk_mtv"
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PlayArrow color="primary" />
                      <Typography>Disk MTV</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="push"
                  control={<Radio color="secondary" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TrendingUp color="secondary" />
                      <Typography>Push</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="disk_mtv_crownnote"
                  control={<Radio color="warning" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Star color="warning" />
                      <Typography>Disk MTV (Pontuação Crownnote)</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !texto.trim()}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                "&:hover": {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                },
              }}
            >
              {loading ? "Processando..." : "Processar Músicas"}
            </Button>
          </Box>
        </Paper>

        {/* Loading */}
        {loading && (
          <Box sx={{ mb: 4 }}>
            <LinearProgress
              sx={{
                height: 8,
                borderRadius: 4,
                background: alpha(theme.palette.primary.main, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        )}

        {/* Results Table */}
        {resultado && (
          <Fade in={true} timeout={800}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: "hidden",
              }}
            >
              {/* Table Header */}
              <Box
                sx={{
                  p: 3,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: "white",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <EmojiEvents sx={{ fontSize: 32 }} />
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ fontWeight: 600 }}
                    >
                      Ranking das Músicas Mais Pontuadas
                    </Typography>
                  </Box>
                  <Tooltip title="Copiar tabela formatada">
                    <IconButton
                      onClick={handleCopyTable}
                      sx={{
                        color: "white",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.1)",
                        },
                      }}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  {resultado.length} músicas processadas •{" "}
                  {selecao === "disk_mtv"
                    ? "Disk MTV"
                    : selecao === "disk_mtv_crownnote"
                    ? "Disk MTV (Pontuação Crownnote)"
                    : "Push"}{" "}
                  • Porcentagem baseada na soma dos pontos
                </Typography>
              </Box>

              {/* Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{ background: alpha(theme.palette.grey[50], 0.5) }}
                    >
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Star color="primary" />
                          Posição
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <MusicNote color="primary" />
                          Música
                        </Box>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, fontSize: "1rem" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <TrendingUp color="primary" />
                          Pontuação
                        </Box>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, fontSize: "1rem" }}
                      >
                        Porcentagem
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultado.map(([musica, pontos], index) => {
                      const totalPoints = getTotalPoints();
                      const percentage =
                        totalPoints > 0 ? (pontos / totalPoints) * 100 : 0;

                      return (
                        <Slide
                          direction="up"
                          in={true}
                          timeout={200 + index * 100}
                          key={index}
                        >
                          <TableRow
                            sx={{
                              "&:hover": {
                                background: alpha(
                                  theme.palette.primary.main,
                                  0.05
                                ),
                                transform: "scale(1.01)",
                                transition: "all 0.2s ease-in-out",
                              },
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <TableCell>
                              <Chip
                                label={`#${index + 1}`}
                                size="small"
                                sx={{
                                  background: getRankColor(index),
                                  color: "white",
                                  fontWeight: 700,
                                  fontSize: "0.9rem",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500 }}
                              >
                                {musica}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: getRankColor(index),
                                }}
                              >
                                {pontos.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ width: 200 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Box sx={{ flex: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={percentage}
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      background: alpha(
                                        theme.palette.grey[300],
                                        0.5
                                      ),
                                      "& .MuiLinearProgress-bar": {
                                        borderRadius: 4,
                                        background: `linear-gradient(90deg, ${getRankColor(
                                          index
                                        )}, ${alpha(
                                          getRankColor(index),
                                          0.7
                                        )})`,
                                      },
                                    }}
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ minWidth: 45 }}
                                >
                                  {percentage.toFixed(2)}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </Slide>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Fade>
        )}
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
