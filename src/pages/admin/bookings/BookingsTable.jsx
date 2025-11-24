import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DeleteIcon from "@mui/icons-material/Delete";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const BookingRow = ({ row, onUpdate, onDelete, isStriped }) => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleEditClick = (event) => {
    event.stopPropagation();
    onUpdate(row);
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    onDelete(row.id);
  };

  return (
    <>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          backgroundColor: isHovered
            ? "action.hover"
            : isStriped
            ? "grey.50"
            : "background.paper",
          "&:hover": {
            backgroundColor: "action.hover",
            cursor: "pointer",
          },
          "& .MuiTableCell-root": {
            py: isMobile ? 1 : 1.5,
            px: isMobile ? 0.5 : 2,
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <TableCell sx={{ width: isMobile ? "40px" : "50px" }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell className="text-xs sm:text-sm">{row.serialNo}</TableCell>
        <TableCell className="text-xs sm:text-sm">{row.customer}</TableCell>
        {!isMobile && (
          <>
            <TableCell className="text-xs sm:text-sm">{row.service}</TableCell>
            <TableCell className="text-xs sm:text-sm">{row.location}</TableCell>
          </>
        )}
        <TableCell className="text-xs sm:text-sm">{row.eventDate}</TableCell>
        <TableCell>
          <div className="flex space-x-1">
            <IconButton
              color="primary"
              onClick={handleEditClick}
              size={isMobile ? "small" : "medium"}
            >
              <FontAwesomeIcon icon={faEdit} className="text-sm" />
            </IconButton>
            <IconButton
              color="error"
              onClick={handleDeleteClick}
              size={isMobile ? "small" : "medium"}
            >
              <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={isMobile ? 5 : 7}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 1,
                backgroundColor: isStriped ? "grey.50" : "background.paper",
                borderRadius: 1,
                p: isMobile ? 1 : 2,
              }}
            >
              <Table size="small" aria-label="additional details">
                <TableBody>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        width: isMobile ? "100px" : "150px",
                      }}
                      className="text-xs sm:text-sm"
                    >
                      Booking ID:
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {row.id}
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell
                          sx={{ fontWeight: "bold", width: "150px" }}
                          className="text-xs sm:text-sm"
                        >
                          Customer Contact:
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {row.contact}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  {isMobile && (
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: "bold" }}
                        className="text-xs sm:text-sm"
                      >
                        Service:
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {row.service}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: "bold" }}
                      className="text-xs sm:text-sm"
                    >
                      {isMobile ? "Time:" : "Event Time:"}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {row.eventTime || "N/A"}
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell
                          sx={{ fontWeight: "bold" }}
                          className="text-xs sm:text-sm"
                        >
                          Booked At:
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {row.booked || "N/A"}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  {isMobile && (
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: "bold" }}
                        className="text-xs sm:text-sm"
                      >
                        Location:
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {row.location}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const BookingsTable = ({
  bookings,
  onUpdate,
  onDelete,
  loading,
  bookingType = "pending",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <TableContainer
        sx={{
          maxHeight: "calc(100vh - 200px)",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "grey.400",
            borderRadius: "4px",
          },
        }}
      >
        <Table
          stickyHeader
          aria-label="bookings table"
          sx={{
            "& .MuiTableCell-root": {
              borderBottom: "1px solid",
              borderColor: "divider",
              fontSize: isMobile ? "0.75rem" : "0.875rem",
            },
            "& .MuiTableHead-root": {
              "& .MuiTableRow-root": {
                backgroundColor: "background.paper",
                "& .MuiTableCell-root": {
                  color: "text.primary",
                  fontWeight: "bold",
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  py: isMobile ? 1 : 2,
                  backgroundColor: "background.paper",
                  borderBottom: "2px solid",
                  borderColor: "divider",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                },
              },
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: isMobile ? "40px" : "50px" }} />
              <TableCell sx={{ fontWeight: "bold" }}>S/No</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Customer</TableCell>
              {!isMobile && (
                <>
                  <TableCell sx={{ fontWeight: "bold" }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
                </>
              )}
              <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={isMobile ? 5 : 7}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <CircularProgress size={isMobile ? 24 : 32} />
                </TableCell>
              </TableRow>
            ) : bookings.length > 0 ? (
              bookings.map((row, index) => (
                <BookingRow
                  key={row.id}
                  row={row}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  isStriped={index % 2 !== 0}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={isMobile ? 5 : 7}
                  align="center"
                  sx={{ py: 3 }}
                >
                  <Alert
                    severity="info"
                    sx={{
                      justifyContent: "center",
                      "& .MuiAlert-message": {
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                      },
                    }}
                  >
                    No {bookingType} bookings found.
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default BookingsTable;
