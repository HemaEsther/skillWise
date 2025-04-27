// DOM Elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');
const hangupButton = document.getElementById('hangupButton');
const muteButton = document.getElementById('muteButton');
const videoButton = document.getElementById('videoButton');
const roomInput = document.getElementById('roomId');
const joinButton = document.getElementById('joinButton');
const videoContainer = document.querySelector('.video-container');
const controls = document.querySelector('.controls');
const participantsArea = document.getElementById('participants-area');
const screenShareButton = document.getElementById('screenShareButton');
const leaveButton = document.getElementById('leaveButton');
const participantNameInput = document.getElementById('participantName');
const meetingTitle = document.querySelector('.meeting-title');
const meetingTime = document.querySelector('.meeting-time');

// Chat Elements
const chatContainer = document.getElementById('chat-container');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessageButton = document.getElementById('send-message');
const toggleChatButton = document.getElementById('toggleChat');

// Chat Variables
let isChatCollapsed = true;
let chatPosition = { x: 0, y: 0 };
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// Chat Functions
function setupChatDrag() {
    const chatHeader = chatContainer.querySelector('.chat-header');
    
    chatHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX - chatContainer.offsetLeft;
        dragStartY = e.clientY - chatContainer.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const x = e.clientX - dragStartX;
        const y = e.clientY - dragStartY;
        
        chatContainer.style.left = `${x}px`;
        chatContainer.style.top = `${y}px`;
        chatContainer.style.right = 'auto';
        chatContainer.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function toggleChat() {
    isChatCollapsed = !isChatCollapsed;
    chatContainer.classList.toggle('collapsed');
    toggleChatButton.querySelector('i').classList.toggle('fa-chevron-down');
    toggleChatButton.querySelector('i').classList.toggle('fa-chevron-up');
}

function showChatNotification(message, sender) {
    const notification = document.createElement('div');
    notification.className = 'chat-notification';
    notification.textContent = `${sender}: ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function addMessageToChat(message, sender, isOwn = false) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${isOwn ? 'own' : 'other'}`;
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setupChatListeners() {
    console.log('Setting up chat listeners');
    
    toggleChatButton.addEventListener('click', toggleChat);
    
    sendMessageButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message && room) {
            console.log('Sending chat message:', message);
            const data = {
                type: 'chat',
                message: message,
                sender: participantNameInput.value,
                timestamp: new Date().toISOString()
            };
            
            try {
                // Use the correct method to publish data to all participants
                room.localParticipant.publishData(
                    new TextEncoder().encode(JSON.stringify(data)),
                    {
                        reliable: true,
                        topic: 'chat'
                    }
                );
                console.log('Message published successfully');
                
                // Add message to local chat
                addMessageToChat(message, participantNameInput.value, true);
                chatInput.value = '';
            } catch (error) {
                console.error('Error sending chat message:', error);
                showError('Failed to send message');
            }
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessageButton.click();
        }
    });
}

// Variables
let room;
let localStream;
let isMuted = false;
let isVideoOff = false;
let isScreenSharing = false;
let currentRoom = null;
let isRoomCreator = false; // Track if current user is the room creator
let endRoomButton = null; // Reference to end room button
let activeScreenSharer = null; // Track who is currently sharing their screen
let screenSharePublication = null; // Track the screen share publication

// Configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// Constants
const VIDEO_ELEMENT_CLASS = 'participant-video';
const VIDEO_CONTAINER_CLASS = 'video-container';
const VIDEO_PLACEHOLDER_CLASS = 'video-placeholder';
const PARTICIPANT_DIV_CLASS = 'participant';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    joinButton.addEventListener('click', joinRoom);
    muteButton.addEventListener('click', toggleMute);
    videoButton.addEventListener('click', toggleVideo);
    screenShareButton.addEventListener('click', toggleScreenShare);
    leaveButton.addEventListener('click', leaveRoom);
});

// Functions
async function getToken(roomName, participantName, isRoomCreator) {
    try {
        console.log('Requesting token for:', participantName, 'in room:', roomName);
        const response = await fetch('/get-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomName, participantName, isRoomCreator }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Server response:', data);

        if (!data.token || typeof data.token !== 'string') {
            console.error('Invalid token format:', data);
            throw new Error('Invalid token format received from server');
        }

        if (!data.url) {
            console.error('Missing LiveKit URL:', data);
            throw new Error('Missing LiveKit URL in server response');
        }

        return {
            token: data.token,
            url: data.url
        };
    } catch (error) {
        console.error('Token request failed:', error);
        throw error;
    }
}

function createParticipantElement(participant) {
    const participantDiv = document.createElement('div');
    participantDiv.id = `participant-${participant.identity}`;
    participantDiv.className = 'participant';
    
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    
    const videoElement = document.createElement('video');
    videoElement.id = `video-${participant.identity}`;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.className = 'participant-video';
    
    const placeholder = document.createElement('div');
    placeholder.className = 'video-placeholder';
    placeholder.textContent = participant.identity.charAt(0).toUpperCase();
    
    videoContainer.appendChild(videoElement);
    videoContainer.appendChild(placeholder);
    
    const nameElement = document.createElement('div');
    nameElement.className = 'participant-name';
    nameElement.textContent = participant.identity;
    
    const statusElement = document.createElement('div');
    statusElement.className = 'participant-status';
    statusElement.id = `status-${participant.identity}`;
    
    // Add mute status indicator
    const micStatusElement = document.createElement('div');
    micStatusElement.className = 'mic-status';
    micStatusElement.id = `mic-status-${participant.identity}`;
    micStatusElement.style.display = 'none'; // Hidden by default
    
    const micIcon = document.createElement('i');
    micIcon.className = 'fas fa-microphone-slash';
    micStatusElement.appendChild(micIcon);
    
    participantDiv.appendChild(videoContainer);
    participantDiv.appendChild(nameElement);
    participantDiv.appendChild(statusElement);
    participantDiv.appendChild(micStatusElement);
    
    return participantDiv;
}

// Function to update mic status indicator for a participant
function updateMicStatusIndicator(participant, isMuted) {
    console.log(`Updating mic status for ${participant.identity} to ${isMuted ? 'muted' : 'unmuted'}`);
    const micStatusElement = document.getElementById(`mic-status-${participant.identity}`);
    
    if (micStatusElement) {
        // Display mic status indicator only if muted
        micStatusElement.style.display = isMuted ? 'flex' : 'none';
        
        // Make sure the mic icon is correct
        const micIcon = micStatusElement.querySelector('i');
        if (micIcon) {
            micIcon.className = 'fas fa-microphone-slash';
        }
    } else {
        console.warn(`Mic status element not found for ${participant.identity}`);
        
        // Create mic status element if it doesn't exist
        const participantDiv = document.getElementById(`participant-${participant.identity}`);
        if (participantDiv) {
            const newMicStatusElement = document.createElement('div');
            newMicStatusElement.className = 'mic-status';
            newMicStatusElement.id = `mic-status-${participant.identity}`;
            newMicStatusElement.style.display = isMuted ? 'flex' : 'none';
            
            const micIcon = document.createElement('i');
            micIcon.className = 'fas fa-microphone-slash';
            newMicStatusElement.appendChild(micIcon);
            
            participantDiv.appendChild(newMicStatusElement);
            console.log(`Created new mic status element for ${participant.identity}`);
        }
    }

    // Broadcast mute status to other participants for visibility
    if (room && participant === room.localParticipant) {
        // Only broadcast our own mute status
        room.localParticipant.setMetadata(JSON.stringify({
            muted: isMuted,
            lastUpdate: Date.now()
        }));
    }
}

// Hook into participant events to update mic status
function setupParticipantTrackListeners(participant) {
    try {
        console.log("Setting up track listeners for participant:", participant.identity);
        
        // Listen for trackSubscribed event to handle initial tracks
        participant.on('trackSubscribed', (track, publication) => {
            console.log(`Track subscribed from ${participant.identity}:`, track.kind);
            
            if (track.kind === 'audio') {
                // Check initial mute status when audio track is subscribed
                updateMicStatusIndicator(participant, publication.isMuted || track.isMuted);
                console.log(`Initial audio track status for ${participant.identity}: ${publication.isMuted ? 'muted' : 'unmuted'}`);
            }
        });
        
        // Setup mute/unmute event listeners
        participant.on('trackMuted', publication => {
            if (publication.kind === 'audio') {
                console.log(`${participant.identity} muted their microphone`);
                updateMicStatusIndicator(participant, true);
            }
        });
        
        participant.on('trackUnmuted', publication => {
            if (publication.kind === 'audio') {
                console.log(`${participant.identity} unmuted their microphone`);
                updateMicStatusIndicator(participant, false);
            }
        });
        
        // Listen for metadata updates which can contain mute status
        participant.on('metadataChanged', (metadata) => {
            try {
                if (metadata) {
                    const data = JSON.parse(metadata);
                    if (data && typeof data.muted === 'boolean') {
                        console.log(`Metadata update from ${participant.identity}: muted=${data.muted}`);
                        updateMicStatusIndicator(participant, data.muted);
                    }
                }
            } catch (error) {
                console.warn('Error parsing participant metadata:', error);
            }
        });
        
        // If participant already has audio tracks, check their status immediately
        if (participant.audioTracks && typeof participant.audioTracks.values === 'function') {
            const audioPublications = Array.from(participant.audioTracks.values());
            if (audioPublications.length > 0) {
                const isMuted = audioPublications.some(pub => pub.isMuted);
                updateMicStatusIndicator(participant, isMuted);
                console.log(`Initial mic status for ${participant.identity}: ${isMuted ? 'muted' : 'unmuted'}`);
            } else {
                console.log(`No audio tracks found for ${participant.identity}`);
                // Since we don't have audio tracks yet, assume initially muted
                updateMicStatusIndicator(participant, true);
            }
        } else if (participant.tracks && typeof participant.tracks.values === 'function') {
            // Fallback for checking track publications
            console.log(`Using fallback method for ${participant.identity}`);
            
            // Check if any audio track exists using alternative API methods
            const trackPublications = Array.from(participant.tracks.values());
            const audioPublication = trackPublications.find(pub => pub.kind === 'audio');
            
            if (audioPublication) {
                updateMicStatusIndicator(participant, audioPublication.isMuted);
                console.log(`Fallback mic status for ${participant.identity}: ${audioPublication.isMuted ? 'muted' : 'unmuted'}`);
            } else {
                console.log(`No audio tracks found for ${participant.identity} (fallback check)`);
                // Since we don't have audio tracks yet, assume initially muted
                updateMicStatusIndicator(participant, true);
            }
        } else {
            console.log(`Cannot determine initial mic status for ${participant.identity}`);
            // Default to muted until we get an update
            updateMicStatusIndicator(participant, true);
        }

        // Check metadata for mute status information
        if (participant.metadata) {
            try {
                const data = JSON.parse(participant.metadata);
                if (data && typeof data.muted === 'boolean') {
                    console.log(`Initial metadata for ${participant.identity}: muted=${data.muted}`);
                    updateMicStatusIndicator(participant, data.muted);
                }
            } catch (error) {
                console.warn('Error parsing initial participant metadata:', error);
            }
        }
    } catch (error) {
        console.error('Error setting up participant track listeners:', error);
    }
}

// Helper functions
function createVideoElement(participantId) {
    const videoElement = document.createElement('video');
    videoElement.id = `video-${participantId}`;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.className = VIDEO_ELEMENT_CLASS;
    return videoElement;
}

function createAudioElement(participantId) {
    const audioElement = document.createElement('audio');
    audioElement.id = `audio-${participantId}`;
    audioElement.autoplay = true;
    audioElement.style.display = 'none';
    return audioElement;
}

function getParticipantElements(participantId) {
    const participantDiv = document.getElementById(`participant-${participantId}`);
    if (!participantDiv) return null;

    const videoContainer = participantDiv.querySelector(`.${VIDEO_CONTAINER_CLASS}`);
    const placeholder = videoContainer?.querySelector(`.${VIDEO_PLACEHOLDER_CLASS}`);
    const videoElement = document.getElementById(`video-${participantId}`);

    return { participantDiv, videoContainer, placeholder, videoElement };
}

function updateParticipantGrid() {
    // Count the number of participant divs
    const participantCount = participantsArea.querySelectorAll('.participant').length;
    
    // Remove all participant count classes
    participantsArea.className = '';
    
    // Add the appropriate class based on the number of participants
    participantsArea.classList.add(`participants-${participantCount}`);
    
    console.log(`Updated grid layout for ${participantCount} participants`);
}

async function handleTrackSubscribed(track, publication, participant) {
    console.log('Track subscribed:', track.kind, 'from', participant.identity, 'source:', publication.source);
    
    // Check if this is a screen share track
    if (track.kind === 'video' && publication.source === 'screenShare') {
        console.log('Screen share track detected from:', participant.identity);
        handleScreenShareTrack(track, participant);
        return;
    }
    
    // Ensure participant element exists
    let participantDiv = document.getElementById(`participant-${participant.identity}`);
    if (!participantDiv) {
        console.log('Creating missing participant element for:', participant.identity);
        participantDiv = createParticipantElement(participant);
        participantsArea.appendChild(participantDiv);
        updateParticipantGrid();
    }
    
    if (track.kind === 'video') {
        const elements = getParticipantElements(participant.identity);
        if (!elements) {
            console.error(`Failed to get participant elements for ${participant.identity} even after creation`);
            return;
        }

        let { videoElement, placeholder } = elements;

        // Create video element if it doesn't exist
        if (!videoElement) {
            videoElement = createVideoElement(participant.identity);
            elements.videoContainer.appendChild(videoElement);
            console.log('Created video element for participant:', participant.identity);
        }

        try {
            // Attach the new track
            track.attach(videoElement);
            console.log('Video track attached for:', participant.identity);
            
            // Hide placeholder
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        } catch (error) {
            console.error('Error handling video track:', error);
            if (placeholder) {
                placeholder.style.display = 'block';
            }
        }
    } else if (track.kind === 'audio') {
        await handleAudioTrack(track, participant);
        
        // Update mic status based on the current mute state
        const isMuted = publication.isMuted || track.isMuted;
        console.log(`Audio track subscribed for ${participant.identity}, muted: ${isMuted}`);
        updateMicStatusIndicator(participant, isMuted);
    }
}

async function handleAudioTrack(track, participant) {
    const audioElement = createAudioElement(participant.identity);
    document.body.appendChild(audioElement);
    
    try {
        track.attach(audioElement);
        console.log('Audio track attached');
    } catch (error) {
        console.error('Error handling audio track:', error);
    }
}

// Function to update meeting time
function updateMeetingTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    meetingTime.textContent = timeString;
}

async function handleRoomConnected() {
    console.log('Connected to room:', room.name);
    showSuccess('Connected to room successfully!');
    
    // Show video container and controls
    document.querySelector('.video-container').style.display = 'block';
    document.querySelector('.controls').style.display = 'flex';
    document.querySelector('.room-input').style.display = 'none';
    
    // Show chat container
    chatContainer.style.display = 'block';
    
    // Update meeting title
    meetingTitle.textContent = `Meeting: ${room.name}`;
    
    // Start meeting time counter
    updateMeetingTime();
    setInterval(updateMeetingTime, 1000);
    
    // Setup chat functionality
    setupChatDrag();
    setupChatListeners();
    
    // Set up data channel listener for the room
    room.on('dataReceived', (payload, participant) => {
        let decoded = '';
        if (payload instanceof Uint8Array) {
            decoded = new TextDecoder().decode(payload);
        } else if (typeof payload === 'string') {
            decoded = payload;
        }
        if (decoded) {
            try {
                const data = JSON.parse(decoded);
                console.log('Received data:', data, 'from:', participant.identity);
                if (data.type === 'chat') {
                    console.log('Processing chat message:', data);
                    const isOwn = participant.identity === participantNameInput.value;
                    addMessageToChat(data.message, data.sender, isOwn);
                    if (!isOwn) {
                        showChatNotification(data.message, data.sender);
                    }
                }
            } catch (e) {
                console.error('Error parsing chat data:', e, decoded);
            }
        }
    });

    // Set up data channel listeners for existing participants
    room.participants.forEach((participant) => {
        setupParticipantDataListener(participant);
    });

    // Set up listener for new participants
    room.on('participantConnected', (participant) => {
        console.log('New participant connected:', participant.identity);
        setupParticipantDataListener(participant);
    });
    
    // Handle local tracks
    room.localParticipant.tracks.forEach((publication) => {
        handleLocalTrackPublished(publication);
    });
    
    // Handle remote participants
    room.participants.forEach((participant) => {
        handleParticipantConnected(participant);
    });
    
    // Setup room event listeners
    setupRoomEventListeners(room);
    
    // Create end room button if user is the creator
    if (isRoomCreator) {
        createEndRoomButton();
    }
}

function setupParticipantDataListener(participant) {
    console.log('Setting up data listener for participant:', participant.identity);
    
    participant.on('dataReceived', (payload) => {
        let decoded = '';
        if (payload instanceof Uint8Array) {
            decoded = new TextDecoder().decode(payload);
        } else if (typeof payload === 'string') {
            decoded = payload;
        }
        if (decoded) {
            try {
                const data = JSON.parse(decoded);
                console.log('Received data from participant:', participant.identity, 'payload:', data);
                if (data.type === 'chat') {
                    console.log('Processing chat message from participant:', participant.identity);
                    const isOwn = participant.identity === participantNameInput.value;
                    addMessageToChat(data.message, data.sender, isOwn);
                    if (!isOwn) {
                        showChatNotification(data.message, data.sender);
                    }
                }
            } catch (e) {
                console.error('Error parsing participant chat data:', e, decoded);
            }
        }
    });
}

async function handleParticipantConnected(participant) {
    console.log('Participant connected:', participant.identity);
    
    // Create element for new participant if it doesn't exist
    if (!document.getElementById(`participant-${participant.identity}`)) {
        const participantDiv = createParticipantElement(participant);
        participantsArea.appendChild(participantDiv);
    }
    
    // Set up track listeners for this participant
    handleNewParticipant(participant);
    
    // Đặt trạng thái mic mặc định là tắt cho đến khi có thông tin chính xác
    updateMicStatusIndicator(participant, true);
    
    // Kiểm tra xem người tham gia có audio track không
    if (participant.audioTracks && typeof participant.audioTracks.values === 'function') {
        const audioTracks = Array.from(participant.audioTracks.values());
        if (audioTracks.length > 0) {
            // Đã có audio track, cập nhật trạng thái mic
            const isMuted = audioTracks[0].isMuted;
            updateMicStatusIndicator(participant, isMuted);
            console.log(`Participant ${participant.identity} joined with mic ${isMuted ? 'muted' : 'unmuted'}`);
        }
    }
    
    // Show notification
    showSuccess(`${participant.identity} joined the meeting`);
    
    // Update grid layout
    updateParticipantGrid();
}

// Hàm theo dõi sự kiện từ phòng để cập nhật trạng thái mic
function setupRoomEventListeners(room) {
    if (!room) return;
    
    console.log('Setting up room event listeners');
    
    // Track publication event
    room.on('localTrackPublished', (publication) => {
        console.log('Local track published:', publication.kind);
        handleLocalTrackPublished(publication);
    });
    
    // Track subscription event
    room.on('trackSubscribed', (track, publication, participant) => {
        console.log('Track subscribed event:', track.kind, 'from', participant.identity);
        handleTrackSubscribed(track, publication, participant);
    });
    
    // Track unsubscription event
    room.on('trackUnsubscribed', (track, publication, participant) => {
        console.log('Track unsubscribed:', track.kind, 'from', participant.identity);
        handleTrackUnsubscribed(track, publication, participant);
    });
    
    // Room events for track muting
    room.on('trackMuted', (publication, participant) => {
        console.log('Track muted:', publication.kind, 'from', participant.identity);
        if (publication.kind === 'audio') {
            updateMicStatusIndicator(participant, true);
        }
    });

    room.on('trackUnmuted', (publication, participant) => {
        console.log('Track unmuted:', publication.kind, 'from', participant.identity);
        if (publication.kind === 'audio') {
            updateMicStatusIndicator(participant, false);
        }
    });
    
    // Track publication for screen sharing detection
    room.on('trackPublished', (publication, participant) => {
        console.log('Track published:', publication.kind, 'from', participant.identity, 'source:', publication.source);
        handleTrackPublished(publication, participant);
        
        // Handle screen share publications
        if (publication.kind === 'video' && publication.source === 'screenShare') {
            console.log('Screen share published by:', participant.identity);
            activeScreenSharer = participant.identity;
            
            // If it's not our own screen share, disable our screen share button
            if (room.localParticipant.identity !== participant.identity) {
                screenShareButton.disabled = true;
                screenShareButton.classList.add('screen-share-disabled');
            }
        }
    });
    
    // Handle room disconnection
    room.on('disconnected', (reason) => {
        console.log('Room disconnected:', reason);
        
        // If the room was forcibly ended and the current user is not the creator
        if (!isRoomCreator) {
            showWarning('The room has been ended by the host');
        }
        
        resetUI();
    });
    
    // Participant connection event
    room.on('participantConnected', (participant) => {
        console.log('Participant connected event:', participant.identity);
        handleParticipantConnected(participant);
        
        // Listen for metadata updates from this participant
        participant.on('metadataChanged', (metadata) => {
            try {
                if (metadata) {
                    const metadataObj = JSON.parse(metadata);
                    
                    // Handle screen sharing metadata
                    if (metadataObj.isScreenSharing !== undefined) {
                        if (metadataObj.isScreenSharing) {
                            console.log(`${participant.identity} is now sharing their screen`);
                            activeScreenSharer = participant.identity;
                            // Disable screen share button for all other participants
                            if (room.localParticipant.identity !== participant.identity) {
                                screenShareButton.disabled = true;
                                screenShareButton.classList.add('screen-share-disabled');
                            }
                        } else {
                            console.log(`${participant.identity} stopped sharing their screen`);
                            if (activeScreenSharer === participant.identity) {
                                activeScreenSharer = null;
                                // Screen sharing has ended, reset layout if needed
                                resetScreenSharingLayout();
                            }
                        }
                    }
                    
                    // Handle mute status updates
                    if (metadataObj.muted !== undefined) {
                        updateMicStatusIndicator(participant, metadataObj.muted);
                    }
                }
            } catch (error) {
                console.error('Error parsing participant metadata:', error);
            }
        });
    });
    
    // Participant disconnection event
    room.on('participantDisconnected', (participant) => {
        console.log('Participant disconnected event:', participant.identity);
        
        // If the screen sharer disconnects, reset the screen sharing state
        if (activeScreenSharer === participant.identity) {
            activeScreenSharer = null;
            resetScreenSharingLayout();
        }
        
        handleParticipantDisconnected(participant);
    });
    
    // Listen for metadata updates from existing participants
    if (room.participants && typeof room.participants.forEach === 'function') {
        room.participants.forEach((participant) => {
            participant.on('metadataChanged', (metadata) => {
                try {
                    if (metadata) {
                        const metadataObj = JSON.parse(metadata);
                        
                        // Handle screen sharing metadata
                        if (metadataObj.isScreenSharing !== undefined) {
                            if (metadataObj.isScreenSharing) {
                                console.log(`${participant.identity} is now sharing their screen`);
                                activeScreenSharer = participant.identity;
                                // Disable screen share button for all other participants
                                if (room.localParticipant.identity !== participant.identity) {
                                    screenShareButton.disabled = true;
                                    screenShareButton.classList.add('screen-share-disabled');
                                }
                            } else {
                                console.log(`${participant.identity} stopped sharing their screen`);
                                if (activeScreenSharer === participant.identity) {
                                    activeScreenSharer = null;
                                    // Screen sharing has ended, reset layout if needed
                                    resetScreenSharingLayout();
                                }
                            }
                        }
                        
                        // Handle mute status updates
                        if (metadataObj.muted !== undefined) {
                            updateMicStatusIndicator(participant, metadataObj.muted);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing participant metadata:', error);
                }
            });
        });
    }
    
    // Local participant events
    if (room.localParticipant) {
        const localParticipant = room.localParticipant;
        
        localParticipant.on('trackMuted', publication => {
            console.log('Local track muted:', publication.kind);
            if (publication.kind === 'audio') {
                isMuted = true;
                updateMicStatusIndicator(localParticipant, true);
                
                // Update button UI
                const muteIcon = muteButton.querySelector('i');
                if (muteIcon) muteIcon.className = 'fas fa-microphone-slash';
            }
        });
        
        localParticipant.on('trackUnmuted', publication => {
            console.log('Local track unmuted:', publication.kind);
            if (publication.kind === 'audio') {
                isMuted = false;
                updateMicStatusIndicator(localParticipant, false);
                
                // Update button UI
                const muteIcon = muteButton.querySelector('i');
                if (muteIcon) muteIcon.className = 'fas fa-microphone';
            }
        });
    }
}

// Hàm xử lý người tham gia mới
function handleNewParticipant(participant) {
    // Theo dõi khi người tham gia publish track mới
    participant.on('trackPublished', (publication) => {
        console.log(`${participant.identity} published ${publication.kind} track`);
        if (publication.kind === 'audio') {
            updateMicStatusIndicator(participant, publication.isMuted);
        }
    });

    // Theo dõi khi track được subscribe
    participant.on('trackSubscribed', (track, publication) => {
        console.log(`Subscribed to ${track.kind} track from ${participant.identity}`);
        if (track.kind === 'audio') {
            updateMicStatusIndicator(participant, publication.isMuted || track.isMuted);
        }
    });

    // Theo dõi sự kiện mute/unmute
    participant.on('trackMuted', publication => {
        if (publication.kind === 'audio') {
            console.log(`${participant.identity} muted their microphone`);
            updateMicStatusIndicator(participant, true);
        }
    });
    
    participant.on('trackUnmuted', publication => {
        if (publication.kind === 'audio') {
            console.log(`${participant.identity} unmuted their microphone`);
            updateMicStatusIndicator(participant, false);
        }
    });
}

// Cập nhật hàm joinRoom để thiết lập room event listeners
async function joinRoom() {
    const roomName = roomInput.value.trim();
    const participantName = participantNameInput.value.trim();

    if (!roomName || !participantName) {
        showError('Please enter both room name and your name');
        return;
    }

    try {
        // Check if the room exists by trying to get metadata
        try {
            const checkRoomResponse = await fetch('/check-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomName }),
            });
            
            const roomData = await checkRoomResponse.json();
            isRoomCreator = !roomData.exists;
            console.log('Room exists:', roomData.exists, 'isRoomCreator:', isRoomCreator);
        } catch (error) {
            console.warn('Error checking room existence, assuming new room:', error);
            isRoomCreator = true;
        }

        // Get token from server
        const { token, url } = await getToken(roomName, participantName, isRoomCreator);
        console.log('Connecting to room with token:', token);
        
        // Create room
        room = new LivekitClient.Room({
            adaptiveStream: true,
            dynacast: true,
            videoCaptureDefaults: {
                resolution: LivekitClient.VideoPresets.h720.resolution,
            },
        });

        // Set up event listeners
        room
            .on('participantConnected', handleParticipantConnected)
            .on('participantDisconnected', handleParticipantDisconnected)
            .on('trackSubscribed', handleTrackSubscribed)
            .on('trackUnsubscribed', handleTrackUnsubscribed)
            .on('trackPublished', handleTrackPublished)
            .on('localTrackPublished', handleLocalTrackPublished)
            .on('connected', handleRoomConnected);
            
        // Thiết lập các event listener bổ sung để theo dõi trạng thái mic
        setupRoomEventListeners(room);

        // Connect to room
        await room.connect(url, token);
        console.log('Connected to room:', room.name);
        
        // If room creator, store metadata on the room
        if (isRoomCreator) {
            try {
                // Create "End Room" button for the creator
                createEndRoomButton();
                
                // Save creator info in room metadata
                await fetch('/set-room-metadata', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        roomName, 
                        metadata: JSON.stringify({
                            creatorId: room.localParticipant.identity,
                            createdAt: Date.now()
                        })
                    }),
                });
            } catch (error) {
                console.warn('Error setting room metadata:', error);
            }
        }

        // Cập nhật event listeners cho tất cả người tham gia hiện tại
        if (room.participants) {
            room.participants.forEach((participant) => {
                handleNewParticipant(participant);
            });
        }
        
        // Create local participant element first
        if (room.localParticipant) {
            const localParticipantDiv = createParticipantElement(room.localParticipant);
            localParticipantDiv.classList.add('local-participant');
            participantsArea.appendChild(localParticipantDiv);
            
            // Thiết lập listeners cho local participant
            handleNewParticipant(room.localParticipant);
            
            // Đặt mặc định trạng thái mic ban đầu là không tắt
            updateMicStatusIndicator(room.localParticipant, false);
        } else {
            console.warn("Local participant not available yet");
        }
        
        // Update grid layout
        updateParticipantGrid();
        
        // Wait a bit to ensure DOM is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check device availability first
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');

        // Update icon buttons
        const muteIcon = muteButton.querySelector('i');
        const videoIcon = videoButton.querySelector('i');

        try {
            if (hasCamera && hasMicrophone) {
                // Try to enable both camera and microphone
                await room.localParticipant.enableCameraAndMicrophone();
                isVideoOff = false;
                isMuted = false;
                videoIcon.className = 'fas fa-video';
                muteIcon.className = 'fas fa-microphone';
                console.log('Camera and microphone enabled');
            } else if (hasMicrophone) {
                // Only enable microphone if available
                await room.localParticipant.setMicrophoneEnabled(true);
                isVideoOff = true;
                isMuted = false;
                videoIcon.className = 'fas fa-video-slash';
                muteIcon.className = 'fas fa-microphone';
                videoButton.disabled = true; // Disable video button if no camera
                showWarning('No camera detected. Joining with audio only.');
                console.log('Microphone enabled, no camera available');
            } else {
                // No audio devices available
                isVideoOff = true;
                isMuted = true;
                videoIcon.className = 'fas fa-video-slash';
                muteIcon.className = 'fas fa-microphone-slash';
                videoButton.disabled = true;
                muteButton.disabled = true;
                showWarning('No audio or video devices detected. You can only view the meeting.');
                console.log('No media devices available');
            }
        } catch (error) {
            console.warn('Error accessing media devices:', error);
            
            // Try fallback to audio only if camera fails
            if (hasMicrophone) {
                try {
                    await room.localParticipant.setMicrophoneEnabled(true);
                    isVideoOff = true;
                    isMuted = false;
                    videoIcon.className = 'fas fa-video-slash';
                    muteIcon.className = 'fas fa-microphone';
                    showWarning('Could not access camera. Joining with audio only.');
                    console.log('Fallback to audio only successful');
                } catch (micError) {
                    console.error('Could not enable microphone:', micError);
                    isVideoOff = true;
                    isMuted = true;
                    videoIcon.className = 'fas fa-video-slash';
                    muteIcon.className = 'fas fa-microphone-slash';
                    videoButton.disabled = true;
                    muteButton.disabled = true;
                    showError('Could not access any media devices. You can only view the meeting.');
                }
            } else {
                isVideoOff = true;
                isMuted = true;
                videoIcon.className = 'fas fa-video-slash';
                muteIcon.className = 'fas fa-microphone-slash';
                videoButton.disabled = true;
                muteButton.disabled = true;
                showError('No media devices available. You can only view the meeting.');
            }
        }

        // Update UI
        document.querySelector('.room-input').style.display = 'none';
        document.querySelector('.video-container').style.display = 'flex';
        document.querySelector('.controls').style.display = 'flex';
        
        // Enable available control buttons
        if (!videoButton.disabled) videoButton.disabled = false;
        if (!muteButton.disabled) muteButton.disabled = false;
        screenShareButton.disabled = false;
        leaveButton.disabled = false;

        showSuccess('Successfully joined the room');

        // Check if someone is already sharing their screen in this room
        let isScreenShareActive = false;
        if (room && room.participants && typeof room.participants.forEach === 'function') {
            room.participants.forEach(participant => {
                // Check for screen share tracks from this participant
                if (participant.videoTracks && typeof participant.videoTracks.forEach === 'function') {
                    participant.videoTracks.forEach(publication => {
                        if (publication.source === 'screenShare' && !publication.isMuted) {
                            console.log(`Found active screen share from ${participant.identity}`);
                            activeScreenSharer = participant.identity;
                            isScreenShareActive = true;
                            
                            // Disable our screen share button
                            screenShareButton.disabled = true;
                            screenShareButton.classList.add('screen-share-disabled');
                        }
                    });
                }
                
                // Also check metadata for screen sharing status
                try {
                    if (participant.metadata) {
                        const metadataObj = JSON.parse(participant.metadata);
                        if (metadataObj.isScreenSharing) {
                            console.log(`Participant ${participant.identity} is sharing screen according to metadata`);
                            activeScreenSharer = participant.identity;
                            isScreenShareActive = true;
                            
                            // Disable our screen share button
                            screenShareButton.disabled = true;
                            screenShareButton.classList.add('screen-share-disabled');
                        }
                    }
                } catch (error) {
                    console.error('Error parsing participant metadata:', error);
                }
            });
        }
        
        // If screen sharing is active, update the layout
        if (isScreenShareActive) {
            setTimeout(() => {
                updateLayoutForScreenSharing();
            }, 1000); // Short delay to ensure participants are rendered first
        }

    } catch (error) {
        console.error('Error joining room:', error);
        showError('Failed to join room: ' + error.message);
    }
}

async function startCall() {
    try {
        // Get local media stream
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        // Display local video
        localVideo.srcObject = localStream;
        
        // Create peer connection
        peerConnection = new RTCPeerConnection(configuration);
        
        // Add local stream to peer connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        
        // Handle remote stream
        peerConnection.ontrack = event => {
            remoteVideo.srcObject = event.streams[0];
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    roomId: currentRoom,
                    candidate: event.candidate
                });
            }
        };
        
        // Create and set local description
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Send offer to other peer
        socket.emit('offer', {
            roomId: currentRoom,
            offer: offer
        });
        
        // Update UI
        startButton.disabled = true;
        hangupButton.disabled = false;
        
    } catch (error) {
        console.error('Error starting call:', error);
    }
}

async function handleOffer(data) {
    try {
        if (!peerConnection) {
            // Get local media stream
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // Display local video
            localVideo.srcObject = localStream;
            
            // Create peer connection
            peerConnection = new RTCPeerConnection(configuration);
            
            // Add local stream to peer connection
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
            
            // Handle remote stream
            peerConnection.ontrack = event => {
                remoteVideo.srcObject = event.streams[0];
            };

            // Handle ICE candidates
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        roomId: currentRoom,
                        candidate: event.candidate
                    });
                }
            };
        }

        // Set remote description
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        // Create and send answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('answer', {
            roomId: currentRoom,
            answer: answer
        });
        
        // Update UI
        startButton.disabled = true;
        hangupButton.disabled = false;
        
    } catch (error) {
        console.error('Error handling offer:', error);
    }
}

async function handleAnswer(data) {
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } catch (error) {
        console.error('Error handling answer:', error);
    }
}

async function handleIceCandidate(data) {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
        console.error('Error handling ICE candidate:', error);
    }
}

function hangUp() {
    // Stop all tracks
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    // Clear video sources
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    
    // Update UI
    startButton.disabled = false;
    hangupButton.disabled = true;
}

async function toggleMute() {
    if (!room) return;

    try {
        // Cập nhật trạng thái micro trước để giao diện phản hồi nhanh
        isMuted = !isMuted;
        
        // Update button text and icon
        const muteIcon = muteButton.querySelector('i');
        if (isMuted) {
            muteIcon.className = 'fas fa-microphone-slash';
            showSuccess('Microphone is now muted');
            
            // Show mute icon on video
            updateMicStatusIndicator(room.localParticipant, true);
        } else {
            muteIcon.className = 'fas fa-microphone';
            showSuccess('Microphone is now unmuted');
            
            // Hide mute icon on video
            updateMicStatusIndicator(room.localParticipant, false);
        }
        
        // Thực hiện thay đổi trạng thái micro
        await room.localParticipant.setMicrophoneEnabled(!isMuted);
        
        // Set metadata to ensure other participants see the change
        room.localParticipant.setMetadata(JSON.stringify({
            muted: isMuted,
            lastUpdate: Date.now()
        }));
        
        // Gửi thông báo để các tham gia viên khác biết
        console.log(`Local participant mic ${isMuted ? 'muted' : 'unmuted'}`);
        
    } catch (error) {
        // Nếu xảy ra lỗi, khôi phục trạng thái
        isMuted = !isMuted;
        console.error('Error toggling mute:', error);
        showError('Failed to toggle microphone');
        
        // Cập nhật lại giao diện
        const muteIcon = muteButton.querySelector('i');
        muteIcon.className = isMuted ? 'fas fa-microphone-slash' : 'fas fa-microphone';
        updateMicStatusIndicator(room.localParticipant, isMuted);
    }
}

async function toggleVideo() {
    if (!room) return;

    try {
        console.log("Toggling video, current state:", isVideoOff ? "off" : "on");
        
        // Update UI immediately for better UX
        const videoIcon = videoButton.querySelector('i');
        const placeholder = document.querySelector(`#participant-${room.localParticipant.identity} .video-placeholder`);
        const videoElement = document.getElementById(`video-${room.localParticipant.identity}`);
        const participantDiv = document.getElementById(`participant-${room.localParticipant.identity}`);
        
        // Toggle video state
        isVideoOff = !isVideoOff;
        
        if (isVideoOff) {
            // Turn off camera
            await room.localParticipant.setCameraEnabled(false);
            videoIcon.className = 'fas fa-video-slash';
            showSuccess('Camera is now off');
            
            // Show placeholder
            if (placeholder) {
                placeholder.style.display = 'flex';
            }
            
            // Add class to participant div
            if (participantDiv) {
                participantDiv.classList.add('video-off');
            }
        } else {
            // Turn on camera
            videoIcon.className = 'fas fa-video';
            showSuccess('Camera is now on');
            
            try {
                // Enable camera
                await room.localParticipant.setCameraEnabled(true);
                
                // Hide placeholder
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                
                // Remove class from participant div
                if (participantDiv) {
                    participantDiv.classList.remove('video-off');
                }
                
                // Re-attach video if needed after a short delay (camera needs time to initialize)
                setTimeout(() => {
                    const videoTrack = room.localParticipant.getTrackPublications().find(
                        pub => pub.kind === 'video' && (!pub.source || !pub.source.includes('screen'))
                    );
                    
                    if (videoTrack && videoTrack.track) {
                        // Clear existing video first
                        if (videoElement) {
                            videoElement.srcObject = null;
                            videoTrack.track.attach(videoElement);
                            console.log("Reattached camera track after enabling");
                            
                            // Force play the video element
                            videoElement.play().catch(err => console.warn("Could not play video", err));
                        }
                    } else {
                        console.warn("Camera enabled but no track found");
                    }
                }, 500);
            } catch (error) {
                console.error("Failed to enable camera:", error);
                // Revert UI if camera enabling fails
                isVideoOff = true;
                videoIcon.className = 'fas fa-video-slash';
                if (placeholder) placeholder.style.display = 'flex';
                if (participantDiv) participantDiv.classList.add('video-off');
                showError('Failed to enable camera');
            }
        }
    } catch (error) {
        console.error('Error toggling video:', error);
        showError('Failed to toggle camera');
    }
}

async function toggleScreenShare() {
    if (!room) return;

    try {
        if (!isScreenSharing) {
            // Check if someone else is already sharing screen
            if (activeScreenSharer && activeScreenSharer !== room.localParticipant.identity) {
                showWarning(`${activeScreenSharer} is already sharing their screen.`);
                return;
            }
            
            // Enable screen sharing
            const screenTrack = await room.localParticipant.setScreenShareEnabled(true);
            isScreenSharing = true;
            activeScreenSharer = room.localParticipant.identity;
            screenShareButton.querySelector('i').className = 'fas fa-stop';
            showSuccess('Screen sharing started');
            
            // Let other participants know that you are sharing
            room.localParticipant.setMetadata(JSON.stringify({
                isScreenSharing: true,
                identity: room.localParticipant.identity,
                lastUpdate: Date.now()
            }));
            
            // Update layout for screen share view
            updateLayoutForScreenSharing();
            
            // If we have the local screen track, manually attach it to ensure visibility for the sharer
            if (screenTrack) {
                console.log('Local screen track obtained');
                // Find or create the screen container
                let sharedScreenContainer = document.querySelector('.shared-screen-container');
                if (!sharedScreenContainer) {
                    sharedScreenContainer = document.createElement('div');
                    sharedScreenContainer.className = 'shared-screen-container';
                    const participantsArea = document.getElementById('participants-area');
                    participantsArea.prepend(sharedScreenContainer);
                }
                
                // Create or get video element
                let screenVideo = sharedScreenContainer.querySelector('video');
                if (!screenVideo) {
                    screenVideo = document.createElement('video');
                    screenVideo.id = 'screen-share-video';
                    screenVideo.autoplay = true;
                    screenVideo.playsInline = true;
                    sharedScreenContainer.appendChild(screenVideo);
                }
                
                // Make sure we have the badge
                let sharerBadge = sharedScreenContainer.querySelector('.screen-sharer-badge');
                if (!sharerBadge) {
                    sharerBadge = document.createElement('div');
                    sharerBadge.className = 'screen-sharer-badge';
                    sharerBadge.textContent = `${room.localParticipant.identity}'s Screen`;
                    sharedScreenContainer.appendChild(sharerBadge);
                }
                
                // Directly attach the track to ensure we can see our own screen
                screenTrack.videoTrack?.attach(screenVideo);
            }
        } else {
            await room.localParticipant.setScreenShareEnabled(false);
            isScreenSharing = false;
            activeScreenSharer = null;
            screenShareButton.querySelector('i').className = 'fas fa-desktop';
            showSuccess('Screen sharing stopped');
            
            // Update metadata to let others know you stopped sharing
            room.localParticipant.setMetadata(JSON.stringify({
                isScreenSharing: false,
                identity: room.localParticipant.identity,
                lastUpdate: Date.now()
            }));
            
            // Reset layout
            resetScreenSharingLayout();
        }
    } catch (error) {
        console.error('Error toggling screen share:', error);
        showError('Failed to toggle screen sharing');
        isScreenSharing = false;
        activeScreenSharer = null;
    }
}

async function leaveRoom() {
    try {
        if (confirm('Are you sure you want to leave the room?')) {
            if (room) {
                await room.disconnect();
                room = null;
            }
            resetUI();
            showSuccess('Left the room successfully');
        }
    } catch (error) {
        console.error('Error leaving room:', error);
        showError('Failed to leave room: ' + error.message);
    }
}

// Add utility functions for notifications
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    showNotification(notification);
}

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    showNotification(notification);
}

function showWarning(message) {
    const notification = document.createElement('div');
    notification.className = 'notification warning';
    notification.textContent = message;
    showNotification(notification);
}

function showNotification(notification) {
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function resetUI() {
    // Reset UI elements
    document.querySelector('.room-input').style.display = 'block';
    document.querySelector('.video-container').style.display = 'none';
    document.querySelector('.controls').style.display = 'none';
    chatContainer.style.display = 'none';
    
    // Clear participants area
    participantsArea.innerHTML = '';
    
    // Clear chat messages
    chatMessages.innerHTML = '';
    
    // Remove any lingering mic status elements
    document.querySelectorAll('.mic-status').forEach(el => el.remove());
    
    // Remove any screen sharing elements
    const sharedScreenContainer = document.querySelector('.shared-screen-container');
    if (sharedScreenContainer) {
        sharedScreenContainer.remove();
    }
    
    const participantsStrip = document.querySelector('.participants-strip');
    if (participantsStrip) {
        participantsStrip.remove();
    }
    
    // Remove screen share active class
    const videoContainer = document.querySelector('.video-container');
    videoContainer.classList.remove('screen-share-active');
    
    // Reset button states
    muteButton.disabled = true;
    videoButton.disabled = true;
    screenShareButton.disabled = true;
    screenShareButton.classList.remove('screen-share-disabled');
    leaveButton.disabled = true;
    
    // Remove end room button if it exists
    if (endRoomButton) {
        endRoomButton.remove();
        endRoomButton = null;
    }
    
    // Reset variables
    isMuted = false;
    isVideoOff = false;
    isScreenSharing = false;
    isRoomCreator = false;
    activeScreenSharer = null;
    screenSharePublication = null;
}

// Add cleanup function
function cleanup() {
    if (room) {
        room.disconnect();
    }
    resetUI();
}

// Add window unload handler
window.addEventListener('beforeunload', (e) => {
    if (room) {
        e.preventDefault();
        return '';
    }
});

function handleLocalTrackPublished(publication) {
    console.log('Local track published:', publication.kind, 'source:', publication.source, 'trackSid:', publication.trackSid);
    
    // Handle screen sharing track
    if (publication.kind === 'video' && publication.source === 'screenShare') {
        console.log('Local screen share track published');
        screenSharePublication = publication;
        
        // Ensure we can see our own screen by manually attaching the track to the screen container
        if (publication.track) {
            try {
                // Get or create screen container
                let sharedScreenContainer = document.querySelector('.shared-screen-container');
                if (!sharedScreenContainer) {
                    sharedScreenContainer = document.createElement('div');
                    sharedScreenContainer.className = 'shared-screen-container';
                    const participantsArea = document.getElementById('participants-area');
                    participantsArea.prepend(sharedScreenContainer);
                }
                
                // Get or create video element
                let screenVideo = sharedScreenContainer.querySelector('video');
                if (!screenVideo) {
                    screenVideo = document.createElement('video');
                    screenVideo.id = 'screen-share-video';
                    screenVideo.autoplay = true;
                    screenVideo.playsInline = true;
                    sharedScreenContainer.appendChild(screenVideo);
                }
                
                // Directly attach our screen track
                publication.track.attach(screenVideo);
                console.log('Successfully attached our own screen share track');
            } catch (error) {
                console.error('Error attaching local screen share:', error);
            }
        }
        
        // Listen for unpublish to handle local screen share end
        publication.on('unpublished', () => {
            console.log('Local screen share unpublished');
            isScreenSharing = false;
            activeScreenSharer = null;
            screenSharePublication = null;
            resetScreenSharingLayout();
            
            // Update button UI
            screenShareButton.querySelector('i').className = 'fas fa-desktop';
            
            // Update metadata
            room.localParticipant.setMetadata(JSON.stringify({
                isScreenSharing: false,
                identity: room.localParticipant.identity,
                lastUpdate: Date.now()
            }));
        });
        
        return;
    }
    
    if (publication.kind === 'video' && (!publication.source || !publication.source.includes('screen'))) {
        const videoElement = document.getElementById(`video-${room.localParticipant.identity}`);
        const placeholderElement = document.querySelector(`#participant-${room.localParticipant.identity} .video-placeholder`);
        const participantDiv = document.getElementById(`participant-${room.localParticipant.identity}`);
        
        console.log('Local video track published. Video element exists:', !!videoElement, 
                   'Placeholder exists:', !!placeholderElement,
                   'Track exists:', !!publication.track);
        
        if (videoElement && publication.track) {
            try {
                // Remove video-off class
                if (participantDiv) {
                    participantDiv.classList.remove('video-off');
                }
                
                // Clear existing video content
                videoElement.srcObject = null;
                videoElement.pause();
                
                // Attach the track to the video element directly
                publication.track.attach(videoElement);
                console.log('Attaching local video track to video element - track ID:', publication.trackSid);
                
                // Ensure video is playing
                videoElement.play().catch(err => {
                    console.error('Error playing video after attachment:', err);
                });
                
                // Hide placeholder
                if (placeholderElement) {
                    placeholderElement.style.display = 'none';
                }
                
                // Check if video is actually playing after a short delay
                setTimeout(() => {
                    console.log('Video element state check:',
                               'readyState:', videoElement.readyState,
                               'paused:', videoElement.paused,
                               'ended:', videoElement.ended,
                               'videoWidth:', videoElement.videoWidth,
                               'videoHeight:', videoElement.videoHeight);
                    
                    if (videoElement.readyState === 0 || videoElement.paused) {
                        console.warn('Video element not playing despite track attachment, trying again');
                        // Try playing the video element explicitly
                        videoElement.play().catch(err => {
                            console.error('Error playing video on retry:', err);
                        });
                    } else {
                        console.log('Video is playing correctly');
                    }
                }, 1000);
            } catch (error) {
                console.error('Error attaching local video track:', error);
                // Show placeholder if video attachment fails
                if (placeholderElement) {
                    placeholderElement.style.display = 'flex';
                }
                // Add video-off class
                if (participantDiv) {
                    participantDiv.classList.add('video-off');
                }
            }
        } else {
            console.error('Failed to find video element for local participant or track is null');
        }
    } else if (publication.kind === 'audio') {
        console.log('Local audio track published');
    }
}

function handleTrackPublished(publication, participant) {
    console.log(`Track published from ${participant.identity}:`, publication.kind, 'source:', publication.source);

    // Handle screen share track
    if (publication.kind === 'video' && publication.source === 'screenShare') {
        console.log('Screen share published by:', participant.identity);
        activeScreenSharer = participant.identity;
        
        // If screen share track is already available, handle it
        if (publication.track) {
            handleScreenShareTrack(publication.track, participant);
        }
        
        // Otherwise wait for subscription
        publication.on('subscribed', (track) => {
            handleScreenShareTrack(track, participant);
        });
        
        // Listen for unpublish to handle screen share end
        publication.on('unpublished', () => {
            console.log('Screen share unpublished by:', participant.identity);
            handleScreenShareEnded(participant);
        });
        
        return;
    }

    // Update mute status for audio tracks
    if (publication.kind === 'audio') {
        updateMicStatusIndicator(participant, publication.isMuted);
        
        // Listen for publication mute changes
        publication.on('muted', () => {
            console.log(`Publication ${publication.kind} from ${participant.identity} was muted`);
            updateMicStatusIndicator(participant, true);
        });
        
        publication.on('unmuted', () => {
            console.log(`Publication ${publication.kind} from ${participant.identity} was unmuted`);
            updateMicStatusIndicator(participant, false);
        });
    }

    // For regular video tracks, handle them when subscribed
    if (publication.track) {
        handleTrackSubscribed(publication.track, publication, participant);
    } else {
        // Wait for the track to be subscribed
        publication.on('subscribed', (track) => {
            handleTrackSubscribed(track, publication, participant);
        });
    }
}

function handleTrackUnsubscribed(track, publication, participant) {
    console.log('Track unsubscribed:', track.kind, 'from', participant.identity, 'source:', publication?.source);
    
    // Handle screen share track removal
    if (track.kind === 'video' && publication?.source === 'screenShare') {
        console.log('Screen share track unsubscribed from:', participant.identity);
        handleScreenShareEnded(participant);
        return;
    }
    
    if (track.kind === 'audio') {
        const audioElement = document.getElementById(`audio-${participant.identity}`);
        if (audioElement) {
            audioElement.remove();
        }
    }
}

function handleParticipantDisconnected(participant) {
    console.log('Participant disconnected:', participant.identity);
    
    // Remove participant's element
    const participantDiv = document.getElementById(`participant-${participant.identity}`);
    if (participantDiv) {
        participantDiv.remove();
    }
    
    // Remove any mic status elements that might be lingering
    const micStatusElement = document.getElementById(`mic-status-${participant.identity}`);
    if (micStatusElement) {
        micStatusElement.remove();
    }
    
    // Show notification
    showWarning(`${participant.identity} left the meeting`);
    
    // Update grid layout
    updateParticipantGrid();
}

// Thêm hàm addParticipantTrack mới
function addParticipantTrack(participant, element) {
    console.log(`Adding track element for ${participant.identity}, element kind: ${element.tagName}`);
    
    // Xử lý theo loại phần tử
    if (element.tagName === 'VIDEO') {
        // Tìm phần tử video của người tham gia
        const videoElement = document.getElementById(`video-${participant.identity}`);
        const placeholderElement = document.querySelector(`#participant-${participant.identity} .video-placeholder`);
        
        if (videoElement) {
            // Đảm bảo srcObject được xóa trước khi đính kèm
            videoElement.srcObject = null;
            
            // Đính kèm video mới
            try {
                videoElement.srcObject = element.srcObject;
                videoElement.play().catch(err => console.error('Error playing video:', err));
                
                // Ẩn placeholder nếu video đang phát
                if (placeholderElement) {
                    placeholderElement.style.display = 'none';
                }
                
                console.log(`Successfully attached video for ${participant.identity}`);
            } catch (error) {
                console.error(`Error attaching video for ${participant.identity}:`, error);
            }
        } else {
            console.warn(`No video element found for ${participant.identity}`);
        }
    } else if (element.tagName === 'AUDIO') {
        // Xử lý âm thanh - chỉ cần thêm vào DOM
        element.id = `audio-${participant.identity}`;
        element.style.display = 'none';
        document.body.appendChild(element);
        console.log(`Added audio element for ${participant.identity}`);
    }
}

// Add the createEndRoomButton function after the resetUI function
function createEndRoomButton() {
    // If button already exists, don't create again
    if (endRoomButton) return;
    
    // Create end room button
    endRoomButton = document.createElement('button');
    endRoomButton.id = 'endRoomButton';
    endRoomButton.className = 'control-button end-room';
    endRoomButton.title = 'End Meeting for All';
    
    // Create icon for the button
    const endRoomIcon = document.createElement('i');
    endRoomIcon.className = 'fas fa-power-off';
    
    // Create text for the button
    const endRoomText = document.createElement('span');
    endRoomText.textContent = 'End Room';
    
    // Append elements to button
    endRoomButton.appendChild(endRoomIcon);
    endRoomButton.appendChild(endRoomText);
    
    // Add event listener
    endRoomButton.addEventListener('click', endRoom);
    
    // Add to controls
    const controls = document.querySelector('.controls');
    controls.appendChild(endRoomButton);
    
    // Reorganize controls if they're not already organized
    if (!document.querySelector('.controls-center')) {
        // Get all the other control buttons except the end room button
        const otherButtons = Array.from(controls.querySelectorAll('button:not(#endRoomButton)'));
        
        // Create center container
        const centerContainer = document.createElement('div');
        centerContainer.className = 'controls-center';
        
        // Move other buttons to the center container
        otherButtons.forEach(button => {
            centerContainer.appendChild(button);
        });
        
        // Add center container to controls
        controls.insertBefore(centerContainer, endRoomButton);
    }
}

// Add the endRoom function
async function endRoom() {
    if (!isRoomCreator || !room) {
        console.warn('Only the room creator can end the room');
        showWarning('Only the room creator can end the room');
        return;
    }
    
    if (confirm('Are you sure you want to end the room for all participants?')) {
        try {
            // Send request to server to end the room
            const response = await fetch('/end-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    roomName: room.name,
                    participantId: room.localParticipant.identity
                }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to end room');
            }
            
            // Disconnect from room
            await room.disconnect();
            room = null;
            
            // Reset UI
            resetUI();
            
            // Clean up end room button
            if (endRoomButton) {
                endRoomButton.remove();
                endRoomButton = null;
            }
            
            showSuccess('Room ended successfully');
        } catch (error) {
            console.error('Error ending room:', error);
            showError('Failed to end room: ' + error.message);
        }
    }
}

// Function to update the layout for screen sharing
function updateLayoutForScreenSharing() {
    const videoContainer = document.querySelector('.video-container');
    const participantsArea = document.getElementById('participants-area');
    
    // Add screen share active class to container
    videoContainer.classList.add('screen-share-active');
    
    // Create shared screen container if it doesn't exist
    let sharedScreenContainer = document.querySelector('.shared-screen-container');
    if (!sharedScreenContainer) {
        sharedScreenContainer = document.createElement('div');
        sharedScreenContainer.className = 'shared-screen-container';
        participantsArea.prepend(sharedScreenContainer);
        
        // Add sharer badge
        const sharerBadge = document.createElement('div');
        sharerBadge.className = 'screen-sharer-badge';
        sharerBadge.textContent = `${activeScreenSharer}'s Screen`;
        sharedScreenContainer.appendChild(sharerBadge);
    }
    
    // Create participants strip if it doesn't exist
    let participantsStrip = document.querySelector('.participants-strip');
    if (!participantsStrip) {
        participantsStrip = document.createElement('div');
        participantsStrip.className = 'participants-strip';
        participantsArea.appendChild(participantsStrip);
    }
    
    // Move all participant elements to the strip
    const participantElements = document.querySelectorAll('.participant');
    participantElements.forEach(el => {
        participantsStrip.appendChild(el);
    });
    
    // Disable screen share button for all other participants
    if (room && room.localParticipant && activeScreenSharer !== room.localParticipant.identity) {
        screenShareButton.disabled = true;
        screenShareButton.classList.add('screen-share-disabled');
    }
}

// Function to reset the layout after screen sharing ends
function resetScreenSharingLayout() {
    const videoContainer = document.querySelector('.video-container');
    const participantsArea = document.getElementById('participants-area');
    
    // Remove screen share active class
    videoContainer.classList.remove('screen-share-active');
    
    // Get the shared screen container and remove it
    const sharedScreenContainer = document.querySelector('.shared-screen-container');
    if (sharedScreenContainer) {
        sharedScreenContainer.remove();
    }
    
    // Get participants from the strip and move them back to the main area
    const participantsStrip = document.querySelector('.participants-strip');
    if (participantsStrip) {
        const participantElements = participantsStrip.querySelectorAll('.participant');
        participantElements.forEach(el => {
            participantsArea.appendChild(el);
        });
        participantsStrip.remove();
    }
    
    // Re-enable screen share button for all participants
    screenShareButton.disabled = false;
    screenShareButton.classList.remove('screen-share-disabled');
    
    // Update the grid layout
    updateParticipantGrid();
}

// Function to handle a participant's screen share
function handleScreenShareTrack(track, participant) {
    console.log('Handling screen share track from:', participant.identity);
    
    // Mark this participant as the active screen sharer
    activeScreenSharer = participant.identity;
    
    // Update the layout
    updateLayoutForScreenSharing();
    
    // Get or create the screen container
    let sharedScreenContainer = document.querySelector('.shared-screen-container');
    if (!sharedScreenContainer) {
        sharedScreenContainer = document.createElement('div');
        sharedScreenContainer.className = 'shared-screen-container';
        const participantsArea = document.getElementById('participants-area');
        participantsArea.prepend(sharedScreenContainer);
    }
    
    // Update badge
    let sharerBadge = sharedScreenContainer.querySelector('.screen-sharer-badge');
    if (!sharerBadge) {
        sharerBadge = document.createElement('div');
        sharerBadge.className = 'screen-sharer-badge';
        sharerBadge.textContent = `${participant.identity}'s Screen`;
        sharedScreenContainer.appendChild(sharerBadge);
    }
    sharerBadge.textContent = `${participant.identity}'s Screen`;
    
    // Create video element for the screen share
    let screenVideo = sharedScreenContainer.querySelector('video');
    if (!screenVideo) {
        screenVideo = document.createElement('video');
        screenVideo.id = 'screen-share-video';
        screenVideo.autoplay = true;
        screenVideo.playsInline = true;
        sharedScreenContainer.appendChild(screenVideo);
    }
    
    // Attach the track to the video element
    track.attach(screenVideo);
    
    // Disable screen share button for all participants except the sharer
    if (room && room.localParticipant && activeScreenSharer !== room.localParticipant.identity) {
        screenShareButton.disabled = true;
        screenShareButton.classList.add('screen-share-disabled');
    }
}

// Function to handle when screen sharing stops
function handleScreenShareEnded(participant) {
    console.log('Screen sharing ended by:', participant.identity);
    
    // Only process if this is the active screen sharer
    if (activeScreenSharer === participant.identity) {
        activeScreenSharer = null;
        
        // Reset the layout
        resetScreenSharingLayout();
    }
} 