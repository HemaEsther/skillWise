import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import api from '../../utils/axios'; // Assuming you have an API utility to fetch data
import { toast } from 'react-toastify'; // Optional: to display success/error messages

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]); // Default to an empty array
  const [learners, setLearners] = useState([]); // Default to an empty array
  const [classes, setClasses] = useState([]); // Default to an empty array
  const [discussions, setDiscussions] = useState([]); // Default to an empty array
  const [selectedTab, setSelectedTab] = useState('classes'); // Default to 'classes'
  const [pendingVerifications, setPendingVerifications] = useState([]);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorsRes, learnersRes, classesRes, discussionsRes] = await Promise.all([
          api.get('/users/mentors'),
          api.get('/users/learners'),
          api.get('/classes'),
          api.get('/discussions/all'),
        ]);

        setMentors(mentorsRes.data || []); // Set to an empty array if data is undefined
        setLearners(learnersRes.data || []); // Set to an empty array if data is undefined
        setClasses(classesRes.data?.classes || []); // Set to an empty array if classes are undefined
        setDiscussions(discussionsRes.data?.discussions || []); // Changed to access discussions array

        // Filter mentors with pending verification requests
        const pendingMentors = mentorsRes.data.filter(mentor => 
          mentor.verificationRequested && !mentor.verified
        );
        setPendingVerifications(pendingMentors);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle delete operation
  const handleDelete = async (type, id) => {
    try {
      let endpoint = '';
      switch (type) {
        case 'mentor':
          endpoint = `/users/mentor/${id}`;
          break;
        case 'learner':
          endpoint = `/users/learner/${id}`;
          break;
        case 'class':
          endpoint = `/classes/${id}`;
          break;
        case 'discussion':
          endpoint = `/discussions/${id}`;
          break;
        default:
          throw new Error('Invalid type');
      }

      const response = await api.delete(endpoint);
      
      // After successful delete, filter out the deleted item from the state
      if (response.status === 200) {
        if (type === 'mentor') {
          setMentors(mentors.filter(mentor => mentor._id !== id));
        } else if (type === 'learner') {
          setLearners(learners.filter(learner => learner._id !== id));
        } else if (type === 'class') {
          setClasses(classes.filter(classItem => classItem._id !== id));
        } else if (type === 'discussion') {
          setDiscussions(discussions.filter(discussion => discussion._id !== id));
        }
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  // Verify or unverify mentor
  const handleVerify = async (mentorId, currentStatus) => {
    try {
      const response = await api.put(`/admin/verify-mentor/${mentorId}`);
      
      if (response.status === 200) {
        // Update the mentor verification status in the state
        setMentors(mentors.map(mentor => 
          mentor._id === mentorId ? { ...mentor, verified: true, verificationRequested: false } : mentor
        ));

        // Update pending verifications
        setPendingVerifications(pendingVerifications.filter(mentor => mentor._id !== mentorId));

        toast.success('Mentor verified successfully');
      }
    } catch (error) {
      console.error('Error updating mentor status:', error);
      toast.error(error.response?.data?.message || 'Failed to update mentor status');
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Tab navigation */}
      <div className="tabs">
        <button
          className={`tab ${selectedTab === 'mentors' ? 'active' : ''}`}
          onClick={() => setSelectedTab('mentors')}
        >
          Mentors
          {pendingVerifications.length > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-yellow-500 text-white rounded-full">
              {pendingVerifications.length}
            </span>
          )}
        </button>
        <button
          className={`tab ${selectedTab === 'learners' ? 'active' : ''}`}
          onClick={() => setSelectedTab('learners')}
        >
          Learners
        </button>
        <button
          className={`tab ${selectedTab === 'classes' ? 'active' : ''}`}
          onClick={() => setSelectedTab('classes')}
        >
          Classes
        </button>
        <button
          className={`tab ${selectedTab === 'discussions' ? 'active' : ''}`}
          onClick={() => setSelectedTab('discussions')}
        >
          Discussions
        </button>
      </div>

      {/* Loading spinner */}
      {loading && <div className="loading">Loading...</div>}

      {/* Render Mentors Tab */}
      {selectedTab === 'mentors' && !loading && (
        <div className="overflow-x-auto">
          {pendingVerifications.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-500/20 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Pending Verification Requests</h3>
              <div className="space-y-4">
                {pendingVerifications.map(mentor => (
                  <div key={mentor._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="font-medium">{mentor.name}</h4>
                      <p className="text-sm text-gray-400">{mentor.email}</p>
                      <p className="text-xs text-gray-500">
                        Requested on: {new Date(mentor.verificationRequestDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerify(mentor._id, false)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleDelete('mentor', mentor._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mentors.length > 0 ? (
                mentors.map((mentor) => (
                  <tr key={mentor._id} className="hover:bg-dark-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{mentor.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {mentor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {mentor.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {mentor.verified ? (
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                          Verified
                        </span>
                      ) : mentor.verificationRequested ? (
                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                          Pending
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded-full">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!mentor.verified && (
                        <button
                          onClick={() => handleVerify(mentor._id, mentor.verified)}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete('mentor', mentor._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No Mentors found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Render Learners Tab */}
      {selectedTab === 'learners' && !loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {learners.length > 0 ? (
                learners.map((learner) => (
                  <tr key={learner._id} className="hover:bg-dark-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{learner.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {learner.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {learner.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete('learner', learner._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">No Learners found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Render Classes Tab */}
      {selectedTab === 'classes' && !loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Mentor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {classes.length > 0 ? (
                classes.map((classItem) => (
                  <tr key={classItem._id} className="hover:bg-dark-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{classItem.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {classItem.mentor?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {classItem.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {classItem.enrolledStudents?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete('class', classItem._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No Classes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Render Discussions Tab */}
      {selectedTab === 'discussions' && !loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light uppercase tracking-wider">
                  Replies
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {discussions.length > 0 ? (
                discussions.map((discussion) => (
                  <tr key={discussion._id} className="hover:bg-dark-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{discussion.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {discussion.author?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {discussion.classId?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {discussion.replies?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete('discussion', discussion._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No Discussions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
