import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  alpha,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
  Collapse
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Reply as ReplyIcon,
  Visibility,
  VisibilityOff,
  Comment as CommentIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

const CommentBubble = ({
  comment,
  replies,
  position,
  isSelected,
  onSelect,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  currentUserId,
  onToggleVisibility,
  isHidden
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showReplies, setShowReplies] = useState(false);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: position?.top || 0,
        right: 16,
        width: 'calc(100% - 32px)',
        zIndex: isSelected ? 1001 : 1000,
      }}
    >
      <Paper
        elevation={isSelected ? 8 : 2}
        onClick={() => onSelect(comment.id)}
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.paper,
          border: `1px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          opacity: isHidden ? 0.5 : 1,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          }
        }}
      >
        {/* Comment Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
              {comment.user_name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {comment.user_name || 'Unknown User'}
            </Typography>
          </Box>
          <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(comment.id);
            }}
          >
            {isHidden ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchor(e.currentTarget);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          </Box>
        </Box>

        {/* Selection Info */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Selected text (chars {comment.start_char}-{comment.end_char}):
          </Typography>
          <Typography variant="body2" sx={{
            fontStyle: 'italic',
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            p: 1,
            borderRadius: 1,
            mt: 0.5
          }}>
            "{comment.text_snapshot || 'No text selected'}"
          </Typography>
        </Box>

        {/* Comment Content */}
        <Typography variant="body2" sx={{ mb: 1 }}>
          {comment.comment || comment.content}
        </Typography>

        {/* Comment Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Button
            size="small"
            startIcon={<ReplyIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onReply(comment.id);
            }}
          >
            Reply
          </Button>
          {replies?.length > 0 && (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setShowReplies(!showReplies);
              }}
            >
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </Button>
          )}
        </Box>

        {/* Replies Section */}
        <Collapse in={showReplies}>
          <Box sx={{ mt: 2, pl: 2, borderLeft: `2px solid ${theme.palette.divider}` }}>
            {replies?.map((reply) => (
              <Box key={reply.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                    {reply.user_name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {reply.user_name || 'Unknown User'}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {reply.comment || reply.content}
                </Typography>
              </Box>
            ))}
          </Box>
        </Collapse>

        {/* Comment Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={() => {
            onEdit(comment);
            setMenuAnchor(null);
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onDelete(comment.id);
            setMenuAnchor(null);
          }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onResolve(comment.id);
            setMenuAnchor(null);
          }}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Resolve</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
};

const CommentsPanel = ({
  comments = [],
  documentContent = "",
  onCommentReply,
  onCommentEdit,
  onCommentDelete,
  onCommentResolve,
  selectedCommentId,
  onCommentSelect,
  currentUserId,
  documentHeight = 1000,
  onClose,
}) => {
  const theme = useTheme();
  const panelRef = useRef(null);
  const [hiddenComments, setHiddenComments] = useState(new Set());

  const toggleCommentVisibility = (commentId) => {
    setHiddenComments(prev => {
      const newHidden = new Set(prev);
      if (newHidden.has(commentId)) {
        newHidden.delete(commentId);
      } else {
        newHidden.add(commentId);
      }
      return newHidden;
    });
  };

  // Calculate comment positions based on their text positions
  const commentPositions = useMemo(() => {
    const positions = new Map();

    comments.forEach((comment) => {
      if (comment.start_char !== undefined && comment.end_char !== undefined) {
        // Calculate approximate line position based on character position
        // This is a simplified calculation - you might want to make it more accurate
        const textBeforeComment = documentContent.slice(0, comment.start_char);
        const linesBefore = textBeforeComment.split('\n').length - 1;
        const approximateTop = linesBefore * 24; // Assuming ~24px line height

        positions.set(comment.id, {
          top: Math.max(0, approximateTop),
          comment
        });
      }
    });

    return positions;
  }, [comments, documentContent]);

  // Group replies with their parent comments
  const commentThreads = useMemo(() => {
    const threads = new Map();
    const orphanedReplies = [];

    comments.forEach(comment => {
      if (comment.parent_id) {
        // This is a reply
        if (!threads.has(comment.parent_id)) {
          orphanedReplies.push(comment);
        } else {
          threads.get(comment.parent_id).replies.push(comment);
        }
      } else {
        // This is a top-level comment
        threads.set(comment.id, {
          comment,
          replies: [],
          position: commentPositions.get(comment.id)
        });
      }
    });

    // Handle orphaned replies
    orphanedReplies.forEach(reply => {
      if (threads.has(reply.parent_id)) {
        threads.get(reply.parent_id).replies.push(reply);
      }
    });

    return Array.from(threads.values()).filter(thread => thread.position);
  }, [comments, commentPositions]);

  return (
    <Paper
      ref={panelRef}
      sx={{
        width: 320,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
        borderLeft: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease-in-out',
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommentIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Comments
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: theme.palette.text.secondary }}
        >
          <ExpandMore />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', position: 'relative' }}>
        <Box sx={{ height: documentHeight, position: 'relative' }}>
          {commentThreads.map((thread) => (
            <Box
              key={thread.comment.id}
              sx={{
                position: 'relative',
                pointerEvents: 'auto'
              }}
            >
              <CommentBubble
                comment={thread.comment}
                replies={thread.replies}
                position={thread.position}
                isSelected={selectedCommentId === thread.comment.id}
                onSelect={onCommentSelect}
                onReply={onCommentReply}
                onEdit={onCommentEdit}
                onDelete={onCommentDelete}
                onResolve={onCommentResolve}
                currentUserId={currentUserId}
                onToggleVisibility={toggleCommentVisibility}
                isHidden={hiddenComments.has(thread.comment.id)}
              />

              {/* Connection line from text to comment */}
              {thread.position && !hiddenComments.has(thread.comment.id) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: thread.position.top + 12,
                    left: 0,
                    width: 16,
                    height: 2,
                    backgroundColor: theme.palette.primary.main,
                    opacity: selectedCommentId === thread.comment.id ? 1 : 0.7,
                    transition: 'opacity 0.3s ease',
                    borderTopRightRadius: '2px',
                    borderBottomRightRadius: '2px',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default CommentsPanel;