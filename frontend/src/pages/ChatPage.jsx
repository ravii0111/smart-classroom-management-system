import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/lectureHelpers';

const teacherLinks = [
  { to: '/teacher', label: 'Home' },
  { to: '/lectures', label: 'Lectures' },
  { to: '/create-lecture', label: 'Create Lecture' },
];

const studentLinks = [
  { to: '/student', label: 'Dashboard' },
  { to: '/student/lectures', label: 'Lectures' },
  { to: '/student/attendance', label: 'Attendance' },
];

function ChatPage() {
  const { lectureId } = useParams();
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navConfig = useMemo(() => (
    user?.role === 'STUDENT'
      ? { title: 'Doubt Chat', eyebrow: 'Student Support', logoText: 'ST', links: studentLinks }
      : { title: 'Lecture Chat', eyebrow: 'Teacher Support', logoText: 'TC', links: teacherLinks }
  ), [user?.role]);

  const fetchChatData = async () => {
    try {
      const [participantResponse, messageResponse] = await Promise.all([
        api.get(`/chat/participants/${lectureId}`),
        api.get(`/chat/${lectureId}`),
      ]);

      const nextParticipants = Array.isArray(participantResponse.data) ? participantResponse.data : [];
      setParticipants(nextParticipants);
      setMessages(Array.isArray(messageResponse.data) ? messageResponse.data : []);
      if (!receiverId && nextParticipants.length > 0) {
        const preferredParticipant = nextParticipants.find((item) => (
          user?.role === 'STUDENT' ? item.role === 'TEACHER' : item.role === 'STUDENT'
        )) || nextParticipants[0];
        setReceiverId(String(preferredParticipant.id));
      }
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Unable to load chat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    let intervalId;

    const run = async () => {
      if (!ignore) {
        await fetchChatData();
      }
    };

    run();
    intervalId = window.setInterval(run, 5000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [lectureId, user?.role]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !receiverId) {
      return;
    }

    try {
      setSending(true);
      await api.post('/chat/send', {
        receiverId: Number(receiverId),
        lectureId: Number(lectureId),
        message: draft.trim(),
      });
      setDraft('');
      await fetchChatData();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar {...navConfig} />

      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Lecture Chat</p>
            <h2>Doubt and reply system</h2>
            <p>Students can ask questions after lecture, and teachers can respond in one thread.</p>
          </div>
        </div>

        <div className="teacher-panel">
          {loading ? <div className="loading-spinner" aria-label="Loading" /> : null}
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          {!loading ? (
            <>
              <div className="chat-toolbar">
                <label>
                  Chat With
                  <select value={receiverId} onChange={(event) => setReceiverId(event.target.value)}>
                    {participants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name} ({participant.role})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="chat-thread">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <h4>No messages yet</h4>
                    <p>Start the first conversation for this lecture.</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.senderId === user?.id;
                    return (
                      <article key={message.id} className={`chat-bubble${mine ? ' chat-bubble--mine' : ''}`}>
                        <strong>{mine ? 'You' : message.senderName}</strong>
                        <p>{message.message}</p>
                        <span>{formatDateTime(message.timestamp)}</span>
                      </article>
                    );
                  })
                )}
              </div>

              <form className="chat-form" onSubmit={handleSend}>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type your doubt or reply here..."
                  rows={4}
                />
                <button type="submit" className="primary-button" disabled={sending || !receiverId}>
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default ChatPage;
