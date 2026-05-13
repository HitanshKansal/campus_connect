// frontend/src/pages/QuestionDetail.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import { ThumbsUp, Award, Trash2 } from 'lucide-react';
import useHideChatbot from '../hooks/useHideChatbot';

const QuestionDetail = () => {
  useHideChatbot();
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/questions/${id}`);
      setQuestion(data.question);
      setAnswers(data.answers);
    } catch (err) {
      console.log('Error:', err.message);
      navigate('/questions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvoteQuestion = async () => {
    try {
      const { data } = await API.put(`/questions/${id}/upvote`);
      setQuestion(prev => ({
        ...prev,
        upvotes: data.isUpvoted
          ? [...prev.upvotes, user.id]
          : prev.upvotes.filter(uid => uid !== user.id),
      }));
    } catch (err) {
      console.log('Upvote error:', err.message);
    }
  };

  const handleUpvoteAnswer = async (answerId) => {
    try {
      const { data } = await API.put(`/questions/answers/${answerId}/upvote`);
      setAnswers(prev => prev.map(a =>
        a._id === answerId
          ? {
              ...a,
              upvotes: data.isUpvoted
                ? [...a.upvotes, user.id]
                : a.upvotes.filter(uid => uid !== user.id),
            }
          : a
      ));
    } catch (err) {
      console.log('Answer upvote error:', err.message);
    }
  };

  const handleMarkBest = async (answerId) => {
    try {
      await API.put(`/questions/answers/${answerId}/best`);
      setAnswers(prev => prev.map(a => ({
        ...a,
        isBestAnswer: a._id === answerId,
      })));
      setQuestion(prev => ({ ...prev, isSolved: true }));
    } catch (err) {
      console.log('Mark best error:', err.message);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Delete this answer?')) return;
    try {
      await API.delete(`/questions/answers/${answerId}`);
      setAnswers(prev => prev.filter(a => a._id !== answerId));
      setQuestion(prev => ({ ...prev, answerCount: prev.answerCount - 1 }));
    } catch (err) {
      console.log('Delete error:', err.message);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await API.delete(`/questions/${id}`);
      navigate('/questions');
    } catch (err) {
      console.log('Delete error:', err.message);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/questions/${id}/answers`, {
        content: answerText,
      });
      setAnswers(prev => [...prev, data.answer]);
      setQuestion(prev => ({ ...prev, answerCount: prev.answerCount + 1 }));
      setAnswerText('');
    } catch (err) {
      console.log('Answer error:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>
        <Sidebar onCreatePost={() => {}} />
        <div className="flex-1 sm:ml-64 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-3xl px-4">
            <div className="h-48 shimmer rounded-3xl" />
            <div className="h-32 shimmer rounded-2xl" />
            <div className="h-32 shimmer rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const isQuestionUpvoted = question?.upvotes?.includes(user.id);

  return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>

      <Sidebar onCreatePost={() => {}} />

      <div className="flex-1 sm:ml-64">
        <div className="h-14 sm:hidden" />

        {/* ── Header ── */}
        <div
          className="sticky top-14 sm:top-0 z-40 px-4 sm:px-6 py-3 flex items-center gap-3 border-b"
          style={{ background: 'white', borderColor: '#e5e7eb' }}
        >
          <button
            onClick={() => navigate('/questions')}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
            style={{ background: '#f5f3ff', color: '#7c3aed' }}
          >
            ←
          </button>
          <h1 className="font-black text-gray-900 text-sm sm:text-base truncate flex-1">
            Discussion
          </h1>
          {question?.isSolved && (
            <span
              className="text-xs px-3 py-1 rounded-full font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}
            >
              ✅ Solved
            </span>
          )}
        </div>

        <div className="max-w-3xl mx-auto py-4 px-3 sm:px-6 pb-8 space-y-4">

          {/* ── Question Card ── */}
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div className="flex">

              {/* Vote Column */}
              <div
                className="flex flex-col items-center justify-start px-4 py-6 gap-2 flex-shrink-0"
                style={{
                  background: isQuestionUpvoted ? '#f5f3ff' : '#fafafa',
                  minWidth: '72px',
                  borderRight: '1px solid #f3f4f6',
                }}
              >
                <button
                  onClick={handleUpvoteQuestion}
                  className="flex flex-col items-center gap-1 transition-all hover:scale-110"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: isQuestionUpvoted
                        ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                        : '#f3f4f6',
                    }}
                  >
                    <ThumbsUp
                      size={16}
                      style={{ color: isQuestionUpvoted ? 'white' : '#9ca3af' }}
                      strokeWidth={isQuestionUpvoted ? 2.5 : 1.8}
                    />
                  </div>
                  <span
                    className="text-sm font-black"
                    style={{ color: isQuestionUpvoted ? '#7c3aed' : '#6b7280' }}
                  >
                    {question?.upvotes?.length || 0}
                  </span>
                </button>
                <p className="text-xs text-gray-400 font-medium">votes</p>
              </div>

              {/* Content */}
              <div className="flex-1 p-5 min-w-0">

                {/* Title */}
                <h2 className="text-xl font-black text-gray-900 mb-3 leading-tight">
                  {question?.title}
                </h2>

                {/* Content */}
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm mb-4">
                  {question?.content}
                </p>

                {/* Tags */}
                {question?.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {question.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl text-xs font-bold"
                        style={{ background: '#f5f3ff', color: '#7c3aed' }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author + Actions */}
                <div className="flex items-center justify-between pt-4 border-t"
                  style={{ borderColor: '#f3f4f6' }}>
                  <div className="flex items-center gap-2">
                    <img
                      src={question?.author?.profilePicture ||
                        `https://ui-avatars.com/api/?name=${question?.author?.name}&background=7c3aed&color=fff&size=32`}
                      className="w-7 h-7 rounded-xl object-cover cursor-pointer hover:opacity-80 transition"
                      alt={question?.author?.name}
                      onClick={() => navigate(`/profile/${question?.author?.username}`)}
                    />
                    <div>
                      <button
                        onClick={() => navigate(`/profile/${question?.author?.username}`)}
                        className="text-xs font-black hover:underline block"
                        style={{ color: '#7c3aed' }}
                      >
                        @{question?.author?.username}
                      </button>
                      <p className="text-xs text-gray-400">{formatTime(question?.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>👁️ {question?.views} views</span>
                    <span>•</span>
                    <span>💬 {question?.answerCount} answers</span>
                    {question?.author?._id === user.id && (
                      <>
                        <span>•</span>
                        <button
                          onClick={handleDeleteQuestion}
                          className="flex items-center gap-1 transition-all hover:text-red-500"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Answers Header ── */}
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-gray-800 text-lg">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h3>
            {question?.isSolved && (
              <span className="text-xs font-bold text-green-600">
                ✅ Best answer marked
              </span>
            )}
          </div>

          {/* ── Answers List ── */}
          <div className="space-y-3">
            {answers.map(answer => {
              const isAnswerUpvoted = answer.upvotes?.includes(user.id);

              return (
                <div
                  key={answer._id}
                  className="bg-white rounded-3xl overflow-hidden transition-all"
                  style={{
                    border: answer.isBestAnswer
                      ? '2px solid #10b981'
                      : '1px solid #e5e7eb',
                  }}
                >
                  {/* Best Answer Badge */}
                  {answer.isBestAnswer && (
                    <div
                      className="flex items-center gap-2 px-5 py-2.5"
                      style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}
                    >
                      <Award size={14} style={{ color: '#059669' }} />
                      <span className="text-xs font-black text-green-700">
                        Best Answer
                      </span>
                    </div>
                  )}

                  <div className="flex">

                    {/* Vote Column */}
                    <div
                      className="flex flex-col items-center justify-start px-4 py-6 gap-2 flex-shrink-0"
                      style={{
                        background: isAnswerUpvoted ? '#f5f3ff' : '#fafafa',
                        minWidth: '72px',
                        borderRight: '1px solid #f3f4f6',
                      }}
                    >
                      <button
                        onClick={() => handleUpvoteAnswer(answer._id)}
                        className="flex flex-col items-center gap-1 transition-all hover:scale-110"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                          style={{
                            background: isAnswerUpvoted
                              ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                              : '#f3f4f6',
                          }}
                        >
                          <ThumbsUp
                            size={16}
                            style={{ color: isAnswerUpvoted ? 'white' : '#9ca3af' }}
                            strokeWidth={isAnswerUpvoted ? 2.5 : 1.8}
                          />
                        </div>
                        <span
                          className="text-sm font-black"
                          style={{ color: isAnswerUpvoted ? '#7c3aed' : '#6b7280' }}
                        >
                          {answer.upvotes?.length || 0}
                        </span>
                      </button>
                      <p className="text-xs text-gray-400 font-medium">votes</p>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1 p-5 min-w-0">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm mb-4">
                        {answer.content}
                      </p>

                      {/* Answer Footer */}
                      <div
                        className="flex items-center justify-between pt-4 border-t"
                        style={{ borderColor: '#f3f4f6' }}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={answer.author?.profilePicture ||
                              `https://ui-avatars.com/api/?name=${answer.author?.name}&background=7c3aed&color=fff&size=28`}
                            className="w-7 h-7 rounded-xl object-cover cursor-pointer hover:opacity-80 transition"
                            alt={answer.author?.name}
                            onClick={() => navigate(`/profile/${answer.author?.username}`)}
                          />
                          <div>
                            <button
                              onClick={() => navigate(`/profile/${answer.author?.username}`)}
                              className="text-xs font-black hover:underline block"
                              style={{ color: '#7c3aed' }}
                            >
                              @{answer.author?.username}
                            </button>
                            <p className="text-xs text-gray-400">
                              {formatTime(answer.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Mark Best — only question author can */}
                          {question?.author?._id === user.id && !answer.isBestAnswer && (
                            <button
                              onClick={() => handleMarkBest(answer._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                              style={{ background: '#ecfdf5', color: '#059669' }}
                            >
                              <Award size={12} />
                              Mark Best
                            </button>
                          )}

                          {/* Delete — only answer author */}
                          {answer.author?._id === user.id && (
                            <button
                              onClick={() => handleDeleteAnswer(answer._id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                              style={{ background: '#fef2f2', color: '#ef4444' }}
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Write Answer ── */}
          <div
            className="bg-white rounded-3xl p-6"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <h3 className="font-black text-gray-900 text-lg mb-1">
              Your Answer
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Help a fellow student — be clear, specific and kind 💡
            </p>

            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write a helpful, detailed answer..."
                rows={5}
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none resize-none"
                style={{
                  background: '#f9fafb',
                  border: '2px solid #e5e7eb',
                }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {answerText.length} characters
                </p>
                <button
                  type="submit"
                  disabled={submitting || !answerText.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Posting...
                    </>
                  ) : (
                    <>💡 Post Answer</>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;