import { Container } from "react-bootstrap";
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Twitter, Facebook, Instagram, YouTube } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTiktok } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const twitter = import.meta.env.VITE_TWITTER;
  const facebook = import.meta.env.VITE_FACEBOOK;
  const instagram = import.meta.env.VITE_INSTAGRAM;
  const tiktok = import.meta.env.VITE_TIKTOK;
  const youtube = import.meta.env.VITE_YOUTUBE;

  const socialLinks = [
    {
      name: "Twitter",
      url: twitter,
      icon: Twitter,
      component: "mui",
    },
    {
      name: "Facebook",
      url: facebook,
      icon: Facebook,
      component: "mui",
    },
    {
      name: "Instagram",
      url: instagram,
      icon: Instagram,
      component: "mui",
    },
    {
      name: "TikTok",
      url: tiktok,
      icon: faTiktok,
      component: "fontawesome",
    },
    {
      name: "YouTube",
      url: youtube,
      icon: YouTube,
      component: "mui",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        background: "linear-gradient(180deg, #2F364D 0%, #1A1C23 100%)",
        color: "#fff",
        position: "fixed",
        bottom: 0,
        overflow: "hidden",
        zIndex: 1000,
        mt: "auto",
        height: { xs: "auto", sm: "70px" },
        py: { xs: 2, sm: 0 },
      }}
    >
      {/* Wavy Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='%235A6DFF'/%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' fill='%235A6DFF'/%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='%235A6DFF'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
          zIndex: 1,
        }}
      />

      {/* Additional wave pattern for depth */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%2300B8C8'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          zIndex: 1,
        }}
      />

      <Box
        py={{ xs: 2, sm: 1.5 }}
        position="relative"
        zIndex={2}
        height="100%"
        display="flex"
        alignItems="center"
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          {/* Main content row - Copyright left, Social right */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center", sm: "center" },
              gap: { xs: 2, sm: 1 },
              width: "100%",
            }}
          >
            {/* Copyright Text - Left */}
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-start" },
                alignItems: "center",
                width: { xs: "100%", sm: "auto" },
                order: { xs: 2, sm: 1 },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  textAlign: { xs: "center", sm: "left" },
                  lineHeight: 1.2,
                }}
              >
                © 2025 Offworld Media. All rights reserved.
              </Typography>
            </Box>

            {/* Social Links - Right */}
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-end" },
                alignItems: "center",
                width: { xs: "100%", sm: "auto" },
                order: { xs: 1, sm: 2 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 1.5 },
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    mr: { xs: 1, sm: 1.5 },
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Follow & Contact us:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.75rem",
                    mr: 1,
                    display: { xs: "block", sm: "none" },
                  }}
                >
                  Follow & Contact us:
                </Typography>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#FFFFFF",
                      bgcolor: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      "&:hover": {
                        color: "#D6A75D",
                        bgcolor: "rgba(255, 255, 255, 0.15)",
                        borderColor: "rgba(214, 167, 93, 0.3)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(214, 167, 93, 0.2)",
                      },
                      transition: "all 0.3s ease",
                      width: { xs: 32, sm: 36, md: 40 },
                      height: { xs: 32, sm: 36, md: 40 },
                    }}
                    size="small"
                  >
                    {social.component === "fontawesome" ? (
                      <FontAwesomeIcon
                        icon={social.icon}
                        style={{
                          fontSize: isMobile
                            ? "16px"
                            : isTablet
                            ? "18px"
                            : "20px",
                        }}
                      />
                    ) : (
                      <social.icon
                        sx={{
                          fontSize: {
                            xs: 16,
                            sm: 18,
                            md: 20,
                          },
                        }}
                      />
                    )}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
