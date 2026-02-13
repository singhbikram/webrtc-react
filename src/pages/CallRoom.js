import React, { useState } from 'react';
import CallControls from '../components/CallControls';
import { useAudioCall } from '../hooks/useAudioCall';
import { useAuth } from '../hooks/useAuth';
import { callService } from '../services/callService';

function CallRoom() {
  const { startCall, endCall, toggleMute, isMuted } = useAudioCall();
  const { user, logout } = useAuth();

  const [target, setTarget] = useState('');
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null); // null | { available: boolean, user }
  const [error, setError] = useState('');
  const [inCall, setInCall] = useState(false);
  const [calling, setCalling] = useState(false);

  const checkAvailability = async () => {
    setError('');
    setAvailability(null);
    if (!target.trim()) {
      setError('Enter a username');
      return;
    }
    setChecking(true);
    try {
      const res = await callService.checkUserAvailability(target.trim());
      setAvailability(res);
    } catch (e) {
      setError(e.message || 'Failed to check availability');
    } finally {
      setChecking(false);
    }
  };

  const handleCall = async () => {
    setError('');
    if (!availability?.available) {
      setError('User is not available');
      return;
    }
    setCalling(true);
    try {
      // Initiate call signaling + start WebRTC
      await callService.initiateCall(target.trim());
      startCall();
      setInCall(true);
    } catch (e) {
      setError(e.message || 'Failed to start call');
    } finally {
      setCalling(false);
    }
  };

  const handleEndCall = async () => {
    try {
      endCall();
      setInCall(false);
      setTarget('');
      setAvailability(null);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to end call');
    }
  };


  return (
    <div className="call-room-page" style={{ padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>WebRTC Audio Call</h1>
        <div>
          <span style={{ marginRight: 12 }}>Welcome, {user?.username || 'User'}!</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {!inCall ? (
        // Before call: search and initiate
        <section style={{ marginTop: 24, maxWidth: 720 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Username to call"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') checkAvailability(); }}
              disabled={checking}
            />
            <button onClick={checkAvailability} disabled={checking}>{checking ? 'Checking...' : 'Check'}</button>
            <button onClick={handleCall} disabled={!availability?.available || calling} style={{ background: calling ? '#ccc' : '#4caf50' }}>
              {calling ? 'Calling...' : 'Call'}
            </button>
          </div>

          {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}

          {availability && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 6, background: availability.available ? '#e8f5e9' : '#ffebee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {availability.user?.profilePicture ? (
                    <img src={availability.user.profilePicture} alt={availability.user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <span style={{ fontWeight: 700 }}>{availability.user?.username?.[0]?.toUpperCase() || target?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{availability.user?.username || target}</div>
                  <div style={{ fontSize: 13 }}>{availability.available ? '✅ Available' : '❌ Not available'}</div>
                </div>
              </div>
            </div>
          )}
        </section>
      ) : (
        // During call: show controls
        <section style={{ marginTop: 24, maxWidth: 720 }}>
          <div style={{ padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2>In Call with {target}</h2>
              <p style={{ color: '#666' }}>Connected</p>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={toggleMute}
                style={{
                  padding: '12px 24px',
                  background: isMuted ? '#ff9800' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>
              <button
                onClick={handleEndCall}
                style={{
                  padding: '12px 24px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                📞 End Call
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default CallRoom;