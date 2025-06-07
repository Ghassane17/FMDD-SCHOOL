import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { updateInstructorProfile, updateInstructorSkills, updateInstructorLanguages, updateInstructorCertifications } from '../../services/api_instructor';
import { Loader2, User, Lock, Star, Globe, Award, Save } from 'lucide-react';
import SkillsForm from "./profile-completion-formateur/SkillsForm";
import LanguagesForm from "./profile-completion-formateur/LanguagesForm";
import CertificationsForm from "./profile-completion-formateur/CertificationsForm";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  IconButton,
  CircularProgress,
  Grid,
  Divider,
  Alert,
  Container
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Star as StarIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

export default function AccountSettings({ instructorData, backend_url }) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  // Form states
  const [formData, setFormData] = useState({
    name: instructorData?.user?.name || '',
    email: instructorData?.user?.email || '',
    bio: instructorData?.user?.bio || ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTab, setEditTab] = useState('skills');
  const [skills, setSkills] = useState(instructorData?.skills || []);
  const [languages, setLanguages] = useState(instructorData?.languages || []);
  const [certifications, setCertifications] = useState(instructorData?.certifications || []);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showLanguagesModal, setShowLanguagesModal] = useState(false);
  const [showCertificationsModal, setShowCertificationsModal] = useState(false);
  const [skillsBuffer, setSkillsBuffer] = useState(skills);
  const [languagesBuffer, setLanguagesBuffer] = useState(languages);
  const [certificationsBuffer, setCertificationsBuffer] = useState(certifications);

  // Add avatar state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatar, setAvatar] = useState(null);

  // Remove the incorrect avatar_url line and add proper URL construction
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '/default-avatar.png';
    if (avatarPath instanceof File) {
      return URL.createObjectURL(avatarPath);
    }
    return avatarPath.startsWith('http') ? avatarPath : `${backend_url}${avatarPath}`;
  };

  // Update form data when instructorData changes
  useEffect(() => {
    if (instructorData?.user) {
      setFormData({
        name: instructorData.user.name || '',
        email: instructorData.user.email || '',
        bio: instructorData.user.bio || ''
      });
      setAvatarPreview(instructorData.user.avatar || null);
      setAvatar(null);
    }
  }, [instructorData]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }
      setAvatar(file);
      setAvatarPreview(file); // Store the File object directly
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('email', formData.email);
      dataToSend.append('bio', formData.bio);
      if (avatar && avatar instanceof File) {
        dataToSend.append('avatar', avatar);
      }

      const response = await updateInstructorProfile(dataToSend);
      setSuccess('Profil mis à jour avec succès');
      
      if (response.instructor) {
        setFormData({
          name: response.instructor.user.name,
          email: response.instructor.user.email,
          bio: response.instructor.user.bio
        });
        setAvatarPreview(response.instructor.user.avatar || null);
        setAvatar(null);
        
        // If avatar was updated, refresh the page after a short delay
        if (avatar) {
          setTimeout(() => {
            window.location.reload();
          }, 1000); // 1 second delay to show the success message
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setPasswordLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateInstructorProfile({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      setSuccess('Mot de passe mis à jour avec succès');
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState(null);
  const [skillsSuccess, setSkillsSuccess] = useState(null);

  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [languagesError, setLanguagesError] = useState(null);
  const [languagesSuccess, setLanguagesSuccess] = useState(null);

  const [certificationsLoading, setCertificationsLoading] = useState(false);
  const [certificationsError, setCertificationsError] = useState(null);
  const [certificationsSuccess, setCertificationsSuccess] = useState(null);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h3" sx={{ 
              color: 'primary.main', 
              fontWeight: 700, 
              letterSpacing: '-0.5px',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}>
              Mon Profil Formateur
            </Typography>
          </Box>
        </Box>
        
        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success}
          </Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Information */}
        <Grid item xs={12} lg={9}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* Personal Information Section */}
            <Paper elevation={2} sx={{ 
              p: { xs: 2, sm: 4, md: 8 }, 
              borderRadius: 3, 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              width: '100%',
              height: 'fit-content',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PersonIcon sx={{ fontSize: { xs: 22, sm: 28 }, color: 'primary.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'center', fontFamily: 'Poppins', textShadow: '2px 2px 4px rgba(0, 124, 185, 0.4)', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                    Informations personnelles
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
              
              {/* Avatar Section */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: { xs: 1.5, sm: 3 }, mb: { xs: 2, sm: 4 }, p: { xs: 1, sm: 3 }, bgcolor: 'rgba(25, 118, 210, 0.04)', borderRadius: 2 }}>
                <Box sx={{ position: 'relative', mb: { xs: 1, sm: 0 } }}>
                  <Avatar
                    src={getAvatarUrl(avatarPreview)}
                    sx={{ width: { xs: 80, sm: 120 }, height: { xs: 80, sm: 120 }, border: '4px solid', borderColor: 'primary.main' }}
                  />
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      color="primary"
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'white',
                        boxShadow: 2,
                        '&:hover': { backgroundColor: 'grey.100' },
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 }
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                    </IconButton>
                  </label>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'center', sm: 'left' }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  Cliquez sur l'icône pour changer votre photo de profil
                </Typography>
              </Box>
              
              {/* Personal Info Fields */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 3 }}>
                <TextField
                  label="Nom complet"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Biographie professionnelle"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={10}
                  placeholder="Décrivez votre expérience et expertise..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={profileLoading}
                  onClick={handleProfileUpdate}
                  startIcon={profileLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                  fullWidth={true}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    fontSize: { xs: '1rem', sm: '1rem' },
                    maxWidth: { xs: '100%', sm: 240 }
                  }}
                >
                  {profileLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Box>
            </Paper>

            {/* Skills, Languages, Certifications Section */}
            <Paper elevation={2} sx={{ 
              p: { xs: 2, sm: 6, md: 12 }, 
              borderRadius: 3, 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 3, sm: 4 }
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 3, textAlign: 'center', fontSize: { xs: '1.5rem', sm: '2rem' }, fontFamily: 'Poppins', textShadow: '2px 2px 4px rgba(0, 124, 185, 0.2)' }}>
                Compétences & Qualifications
              </Typography>
              <Divider sx={{ mb: { xs: 2, sm: 3 }, width: '100%' }} />
              <Grid container spacing={3} direction={{ xs: 'column', md: 'row' }} alignItems="stretch">
                {/* Skills */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    bgcolor: 'rgba(25, 118, 210, 0.04)', 
                    borderRadius: 2, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: { xs: 2, md: 0 }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <StarIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Compétences
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, flex: 1, justifyContent: 'center' }}>
                      {skills.length > 0 ? (
                        skills.slice(0, 3).map((skill, index) => (
                          <Box key={index} sx={{ 
                            px: 2, 
                            py: 0.5, 
                            bgcolor: 'primary.main', 
                            color: 'white', 
                            borderRadius: 1.5, 
                            fontSize: 13, 
                            fontWeight: 500 
                          }}>
                            {skill}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Aucune compétence ajoutée
                        </Typography>
                      )}
                      {skills.length > 3 && (
                        <Box sx={{ 
                          px: 2, 
                          py: 0.5, 
                          bgcolor: 'grey.200', 
                          color: 'text.secondary', 
                          borderRadius: 1.5, 
                          fontSize: 13, 
                          fontWeight: 500 
                        }}>
                          +{skills.length - 3} autres
                        </Box>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      fullWidth
                      sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', fontSize: { xs: '0.95rem', sm: '1rem' } }}
                      onClick={() => { setSkillsBuffer(skills); setShowSkillsModal(true); }}
                    >
                      Gérer les compétences
                    </Button>
                  </Box>
                </Grid>

                {/* Languages */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    bgcolor: 'rgba(46, 125, 50, 0.04)', 
                    borderRadius: 2, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: { xs: 2, md: 0 }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <LanguageIcon sx={{ color: 'success.main', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Langues
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, flex: 1, justifyContent: 'center' }}>
                      {languages.length > 0 ? (
                        languages.slice(0, 3).map((lang, index) => (
                          <Box key={index} sx={{ 
                            px: 2, 
                            py: 0.5, 
                            bgcolor: 'success.main', 
                            color: 'white', 
                            borderRadius: 1.5, 
                            fontSize: 13, 
                            fontWeight: 500 
                          }}>
                            {lang.name}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Aucune langue ajoutée
                        </Typography>
                      )}
                      {languages.length > 3 && (
                        <Box sx={{ 
                          px: 2, 
                          py: 0.5, 
                          bgcolor: 'grey.200', 
                          color: 'text.secondary', 
                          borderRadius: 1.5, 
                          fontSize: 13, 
                          fontWeight: 500 
                        }}>
                          +{languages.length - 3} autres
                        </Box>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      fullWidth
                      sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', fontSize: { xs: '0.95rem', sm: '1rem' } }}
                      onClick={() => { setLanguagesBuffer(languages); setShowLanguagesModal(true); }}
                    >
                      Gérer les langues
                    </Button>
                  </Box>
                </Grid>

                {/* Certifications */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    bgcolor: 'rgba(237, 108, 2, 0.04)', 
                    borderRadius: 2, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <SchoolIcon sx={{ color: 'warning.main', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Certifications
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, flex: 1, justifyContent: 'center' }}>
                      {certifications.length > 0 ? (
                        certifications.slice(0, 3).map((cert, index) => (
                          <Box key={index} sx={{ 
                            px: 2, 
                            py: 0.5, 
                            bgcolor: 'warning.main', 
                            color: 'white', 
                            borderRadius: 1.5, 
                            fontSize: 13, 
                            fontWeight: 500 
                          }}>
                            {cert.name}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Aucune certification ajoutée
                        </Typography>
                      )}
                      {certifications.length > 3 && (
                        <Box sx={{ 
                          px: 2, 
                          py: 0.5, 
                          bgcolor: 'grey.200', 
                          color: 'text.secondary', 
                          borderRadius: 1.5, 
                          fontSize: 13, 
                          fontWeight: 500 
                        }}>
                          +{certifications.length - 3} autres
                        </Box>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      fullWidth
                      sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', fontSize: { xs: '0.95rem', sm: '1rem' } }}
                      onClick={() => { setCertificationsBuffer(certifications); setShowCertificationsModal(true); }}
                    >
                      Gérer les certifications
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Grid>

        {/* Right Column - Password & Security */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ 
            p: { xs: 2, sm: 4, md: 14 }, 
            borderRadius: 3, 
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            height: 'fit-content',
            position: { sm: 'sticky' },
            top: 20,
            width: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <LockIcon sx={{ fontSize: 28, color: 'error.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Sécurité
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <form onSubmit={handleChangePassword}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Mot de passe actuel"
                  name="currentPassword"
                  type="password"
                  variant="outlined"
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'error.main'
                      }
                    }
                  }}
                />
                <TextField
                  label="Nouveau mot de passe"
                  name="newPassword"
                  type="password"
                  variant="outlined"
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'error.main'
                      }
                    }
                  }}
                />
                <TextField
                  label="Confirmer le nouveau mot de passe"
                  name="confirmPassword"
                  type="password"
                  variant="outlined"
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'error.main'
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  disabled={passwordLoading}
                  startIcon={passwordLoading ? <CircularProgress size={20} /> : <LockIcon />}
                  fullWidth={true}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    maxWidth: { xs: '100%', sm: 300 },
                    alignSelf: { xs: 'center', sm: 'flex-end' }
                  }}
                >
                  {passwordLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '0.875rem' } }}>
                <strong>Conseil de sécurité :</strong> Utilisez un mot de passe fort avec au moins 8 caractères, incluant des lettres, chiffres et symboles.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Modals remain unchanged */}
      {showSkillsModal && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/25 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-light transition-colors duration-200"
              onClick={() => setShowSkillsModal(false)}
            >
              ×
            </button>
            <SkillsForm data={skillsBuffer} updateData={setSkillsBuffer} />
            <div className="flex flex-col gap-2 justify-end mt-8 pt-4 border-t border-gray-200">
              {skillsError && <div className="text-red-500 text-center">{skillsError}</div>}
              {skillsSuccess && <div className="text-green-600 text-center">{skillsSuccess}</div>}
              <div className="flex justify-end gap-3">
                <button
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors duration-200"
                  onClick={() => setShowSkillsModal(false)}
                  disabled={skillsLoading}
                >
                  Annuler
                </button>
                <button
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-600 shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-60"
                  onClick={async () => {
                    setSkillsLoading(true);
                    setSkillsError(null);
                    setSkillsSuccess(null);
                    try {
                      await updateInstructorSkills({ skills: skillsBuffer });
                      setSkills(skillsBuffer);
                      setSkillsSuccess('Compétences mises à jour avec succès');
                      setTimeout(() => {
                        setShowSkillsModal(false);
                        setSkillsSuccess(null);
                      }, 1200);
                    } catch (err) {
                      setSkillsError('Erreur lors de la mise à jour des compétences');
                    } finally {
                      setSkillsLoading(false);
                    }
                  }}
                  disabled={skillsLoading}
                >
                  {skillsLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLanguagesModal && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/25 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-light transition-colors duration-200"
              onClick={() => setShowLanguagesModal(false)}
            >
              ×
            </button>
            <LanguagesForm data={languagesBuffer} updateData={setLanguagesBuffer} />
            <div className="flex flex-col gap-2 justify-end mt-8 pt-4 border-t border-gray-200">
              {languagesError && <div className="text-red-500 text-center">{languagesError}</div>}
              {languagesSuccess && <div className="text-green-600 text-center">{languagesSuccess}</div>}
              <div className="flex justify-end gap-3">
                <button
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors duration-200"
                  onClick={() => setShowLanguagesModal(false)}
                  disabled={languagesLoading}
                >
                  Annuler
                </button>
                <button
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-600 shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-60"
                  onClick={async () => {
                    setLanguagesLoading(true);
                    setLanguagesError(null);
                    setLanguagesSuccess(null);
                    try {
                      await updateInstructorLanguages({ languages: languagesBuffer });
                      setLanguages(languagesBuffer);
                      setLanguagesSuccess('Langues mises à jour avec succès');
                      setTimeout(() => {
                        setShowLanguagesModal(false);
                        setLanguagesSuccess(null);
                      }, 1200);
                    } catch (err) {
                      setLanguagesError('Erreur lors de la mise à jour des langues');
                    } finally {
                      setLanguagesLoading(false);
                    }
                  }}
                  disabled={languagesLoading}
                >
                  {languagesLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCertificationsModal && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/25 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-light transition-colors duration-200"
              onClick={() => setShowCertificationsModal(false)}
            >
              ×
            </button>
            <CertificationsForm data={certificationsBuffer} updateData={setCertificationsBuffer} />
            <div className="flex flex-col gap-2 justify-end mt-8 pt-4 border-t border-gray-200">
              {certificationsError && <div className="text-red-500 text-center">{certificationsError}</div>}
              {certificationsSuccess && <div className="text-green-600 text-center">{certificationsSuccess}</div>}
              <div className="flex justify-end gap-3">
                <button
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors duration-200"
                  onClick={() => setShowCertificationsModal(false)}
                  disabled={certificationsLoading}
                >
                  Annuler
                </button>
                <button
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-amber-600 shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-60"
                  onClick={async () => {
                    setCertificationsLoading(true);
                    setCertificationsError(null);
                    setCertificationsSuccess(null);
                    try {
                      await updateInstructorCertifications({ certifications: certificationsBuffer });
                      setCertifications(certificationsBuffer);
                      setCertificationsSuccess('Certifications mises à jour avec succès');
                      setTimeout(() => {
                        setShowCertificationsModal(false);
                        setCertificationsSuccess(null);
                      }, 1200);
                    } catch (err) {
                      setCertificationsError('Erreur lors de la mise à jour des certifications');
                    } finally {
                      setCertificationsLoading(false);
                    }
                  }}
                  disabled={certificationsLoading}
                >
                  {certificationsLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}