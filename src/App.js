// import { useState } from "react";
import { useState } from "react";
import data from "../src/data.json";
console.log(data);
const currentUser = data.currentUser;
const comments = data.comments;

export default function App() {
  const [useComments, setUseComments] = useState(comments);

  useComments.sort((a, b) => b.score - a.score);
  useComments.map((co) => co.replies.sort((a, b) => b.score - a.score));

  return (
    <section>
      {useComments.map((comment, index) => (
        <div className="when__reply">
          <Comment
            useComments={useComments}
            setUseComments={setUseComments}
            index={index + 1}
            comment={comment}
            key={comment.id}
          />
          <div className="replies-comment-container">
            <div className="replies">
              {comment.replies.map((reply) => (
                <Reply
                  useComments={useComments}
                  setUseComments={setUseComments}
                  comment={reply}
                  key={reply.id}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
      <SendComment
        setUseComments={setUseComments}
        useComments={useComments}
        comments={comments}
        type="Send"
      />
    </section>
  );
}

const getLastId = (useComments) => {
  let lastId = 0;
  useComments.forEach((comment) => {
    if (comment.id > lastId) {
      lastId = comment.id;
    }
    comment.replies.forEach((relpy) => {
      if (relpy.id > lastId) {
        lastId = relpy.id;
      }
    });
  });
  return lastId + 1;
};

const Comment = ({ comment, index, useComments, setUseComments }) => {
  const [displayReply, setDisplayReply] = useState(false);

  return (
    <>
      <div className="comment principal-comment-container">
        <div className="comment-container-content">
          <CommentContent
            useComments={useComments}
            setUseComments={setUseComments}
            displayReply={displayReply}
            setDisplayReply={setDisplayReply}
            comment={comment}
            key={comment.id}
          />
        </div>
      </div>

      {displayReply && index === comment.id && (
        <SendReply
          useComments={useComments}
          setUseComments={setUseComments}
          comment={comment}
          key={comment.id}
        />
      )}
    </>
  );
};

const CommentContent = ({
  comment,
  displayReply,
  setDisplayReply,
  useComments,
  setUseComments,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleEdit = () => {
    setIsOpen((isOpen) => (isOpen = true));
  };
  return (
    <>
      <div className="left-comment-container">
        <Vote
          comment={comment}
          useComments={useComments}
          setUseComments={setUseComments}
          key={comment.id}
        />
      </div>
      <div className="right-comment-content">
        <div className="comment-infos">
          <Profile comment={comment} />
          <div className="delete-edit-container">
            {comment.user.username === currentUser.username ? (
              <>
                <DeleteBtn
                  key={comment.id}
                  comment={comment}
                  useComments={useComments}
                  setUseComments={setUseComments}
                />{" "}
                <EditBtn key={comment.id + 10} toggleEdit={toggleEdit} />
              </>
            ) : (
              !("replyingTo" in comment) && (
                <ReplyBtn
                  key={comment.id}
                  displayReply={displayReply}
                  setDisplayReply={setDisplayReply}
                />
              )
            )}
          </div>
        </div>
        {isOpen === false ? (
          <div className="text-container">
            <p>{comment.content}</p>
          </div>
        ) : (
          <Update
            key={comment.id}
            comment={comment}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            useComments={useComments}
            setUseComments={setUseComments}
          />
        )}
      </div>
    </>
  );
};

const SendReply = ({ comment, useComments, setUseComments }) => {
  let [inputField, setInputField] = useState("");
  const [addReply, setAddReply] = useState({
    id: 0,
    content: "",
    createdAt: "Now",
    score: 0,
    replyingTo: `${comment.user.username}`,
    user: {
      image: {
        png: `${currentUser.image.png}`,
        webp: `${currentUser.image.webp}`,
      },
      username: `${currentUser.username}`,
    },
  });

  const commentId = comment.id;

  const handleSendReply = () => {
    if (inputField && inputField.trim() !== "") {
      const updatedComments = useComments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, replies: [...comment.replies, addReply] };
        }
        return comment;
      });
      setUseComments(updatedComments);
      setInputField((inputField = ""));
    }
  };

  return (
    <div className="reply__comment__section add__comment-container new">
      <img
        src="images/avatars/image-juliusomo.webp"
        alt="student wearing glasses"
      />
      <textarea
        className="textarea-comment textarea-reply"
        placeholder="Add a comment..."
        name="add-reply"
        id="add-reply"
        value={inputField}
        onChange={(e) => {
          setInputField((inputField = e.target.value));
          setAddReply({
            ...addReply,
            content: inputField,
            id: getLastId(useComments),
          });
        }}
      ></textarea>
      <button onClick={handleSendReply} className="btn-reply">
        REPLY
      </button>
    </div>
  );
};

const Vote = ({ comment, useComments, setUseComments }) => {
  const [score, setScore] = useState(comment.score);

  const commentId = comment.id;

  const replyScore = (type) => {
    const updatedReplies = useComments.map((co) =>
      co.replies.map((reply) => {
        if (reply.id === comment.id) {
          return { ...reply, score: type === "plus" ? score + 1 : score - 1 };
        }
        return reply;
      })
    );

    console.log(updatedReplies);
    updatedReplies.sort((a, b) => b.score - a.score);

    const updatedComments = useComments.map((co, index) => {
      updatedReplies[index].sort((a, b) => b.score - a.score);
      if (co.user.username === comment.replyingTo)
        return { ...co, replies: updatedReplies[index] };
      return co;
    });
    setUseComments(updatedComments);
  };

  const handleCommentScore = (type) => {
    if ("replyingTo" in comment) {
      replyScore(type);
    } else {
      const updatedComments = useComments.map((co) => {
        if (co.id === commentId) {
          return { ...co, score: type === "plus" ? score + 1 : score - 1 };
        } else {
          return co;
        }
      });
      setUseComments(updatedComments.sort((a, b) => b.score - a.score));
    }
  };

  return (
    <div className="interaction-container">
      <img
        src="/images/icon-plus.svg"
        alt="plus icon"
        className="plus-btn"
        onClick={() => {
          setScore(score + 1);
          handleCommentScore("plus");
        }}
      />
      <p className="interaction-number interaction-number-1">{score}</p>
      <img
        src="/images/icon-minus.svg"
        alt="minus icon"
        className="minus-btn"
        onClick={() => {
          setScore(score - 1);
          handleCommentScore("minus");
        }}
      />
    </div>
  );
};

const DeleteBtn = ({ comment, useComments, setUseComments }) => {
  const [displayPopup, setDisplayPopup] = useState(false);

  return (
    <>
      {displayPopup && (
        <ConfirmationPopup
          key={comment.id}
          displayPopup={displayPopup}
          setDisplayPopup={setDisplayPopup}
          useComments={useComments}
          setUseComments={setUseComments}
          comment={comment}
        />
      )}
      <div
        className="delete-edit"
        onClick={() => setDisplayPopup((displayPopup) => (displayPopup = true))}
      >
        <img src="images/icon-delete.svg" alt="delete icon" />
        <p className="delete">Delete</p>
      </div>
    </>
  );
};

const ConfirmationPopup = ({
  displayPopup,
  setDisplayPopup,
  useComments,
  setUseComments,
  comment,
}) => {
  const handleDeleteReply = () => {
    const filteredReplies = useComments.map((co) =>
      co.replies.filter((reply) => reply.id !== comment.id)
    );
    const updatedComments = useComments.map((co, index) => {
      if (co.user.username === comment.replyingTo)
        return { ...co, replies: filteredReplies[index] };
      return co;
    });
    setUseComments(updatedComments);
  };

  const handleDeleteComment = () => {
    if ("replyingTo" in comment) {
      handleDeleteReply();
    } else {
      const updatedComments = useComments.filter((co) => co.id !== comment.id);
      setUseComments(updatedComments);
    }
  };

  return (
    <div className="delete-confirm-container">
      <div className="delete-confirm">
        <h1>Delete comment</h1>
        <p>
          Are you sure you want to delete this comment? This will remove the
          comment and can't be undone.
        </p>
        <div className="buttons-container">
          <button
            className="delete-cancel-btn"
            onClick={() => setDisplayPopup((displayPopup = false))}
          >
            no, cancel
          </button>
          <button
            className="delete-confirm-btn"
            id="delete-confirm-btn"
            onClick={handleDeleteComment}
          >
            yes, delete
          </button>
        </div>
      </div>
    </div>
  );
};

const EditBtn = ({ toggleEdit }) => {
  return (
    <div className="delete-edit" onClick={toggleEdit}>
      <img src="images/icon-edit.svg" alt="edit icon" />
      <p className="edit">Edit</p>
    </div>
  );
};

const ReplyBtn = ({ displayReply, setDisplayReply }) => {
  const handleDisplayReply = () => {
    setDisplayReply((displayReply) => (displayReply = !displayReply));
  };

  return (
    <div className="reply-container" onClick={handleDisplayReply}>
      <img src="/images/icon-reply.svg" alt="reply icon" />
      <p>Reply</p>
    </div>
  );
};

const Profile = ({ comment }) => {
  return (
    <div className="profile-container">
      <img
        src={comment.user.image.webp}
        alt="smiling girl"
        className="avatar"
      />
      <p className="avatar-name">{comment.user.username}</p>
      <p className="user-comment">you</p>
      <p className="date">{comment.createdAt}</p>
    </div>
  );
};

const Update = ({
  comment,
  isOpen,
  setIsOpen,
  useComments,
  setUseComments,
}) => {
  const [commentValue, setCommentValue] = useState(comment.content);

  const updateReply = (commentValue) => {
    const updatedReplies = useComments.map((co) =>
      co.replies.map((reply) => {
        if (reply.id === comment.id) {
          return { ...reply, content: commentValue };
        }
        return reply;
      })
    );

    const updatedComments = useComments.map((co, index) => {
      if (co.user.username === comment.replyingTo)
        return { ...co, replies: updatedReplies[index] };
      return co;
    });
    setUseComments(updatedComments);
  };

  const handleUpdateComment = (targetValue) => {
    setCommentValue((commentValue) => (commentValue = targetValue));
    if ("replyingTo" in comment) {
      updateReply(commentValue);
    } else {
      const updatedComments = useComments.map((co) => {
        if (co.id === comment.id) {
          return { ...co, content: commentValue };
        }
        return co;
      });
      setUseComments(updatedComments);
    }
  };

  return (
    <div className="update-comment">
      <textarea
        value={commentValue}
        className="update-textarea textarea-comment"
        id="id"
        onChange={(e) => handleUpdateComment(e.target.value)}
      >
        {comment.content}
      </textarea>
      <button
        className="btn-send btn-update"
        onClick={() => {
          if (commentValue !== "" && commentValue.trim() !== "")
            setIsOpen((isOpen = false));
        }}
      >
        UPDATE
      </button>
    </div>
  );
};

const Reply = ({ comment, useComments, setUseComments }) => {
  return (
    <div className="reply reply-comment-container">
      <Comment
        useComments={useComments}
        setUseComments={setUseComments}
        comment={comment}
        key={comment.id}
      />
    </div>
  );
};

const SendComment = ({ type, useComments, setUseComments }) => {
  let [inputField, setInputField] = useState("");
  const [useComment, setUseComment] = useState({
    id: 0,
    content: "",
    createdAt: "Now",
    score: 0,
    user: {
      image: {
        png: `${currentUser.image.png}`,
        webp: `${currentUser.image.webp}`,
      },
      username: `${currentUser.username}`,
    },
    replies: [],
  });

  const handleSendComment = () => {
    if (inputField && inputField.trim() !== "") {
      setUseComments([...useComments, useComment]);
      setInputField((inputField = ""));
    }
  };

  return (
    <div className="add__comment-container">
      <img src={currentUser.image.webp} alt="student wearing glasses" />
      <textarea
        value={inputField}
        className="textarea-comment"
        placeholder="Add a comment..."
        name="add-comment"
        id="add-comment"
        onChange={(e) => {
          setInputField((inputField = e.target.value));
          setUseComment({
            ...useComment,
            content: inputField,
            id: getLastId(useComments),
          });
        }}
      ></textarea>
      <button onClick={handleSendComment} className="btn-send">
        {type}
      </button>
    </div>
  );
};
