import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getLearnerSettings, updateLearnerSettings } from '@/services/api.js';
import { toast } from 'sonner';
import {
    TextField,
    Button,
    Switch,
    Avatar,
    CircularProgress,
    FormControlLabel,
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Divider,
    alpha
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PhotoCamera as PhotoCameraIcon,
    Person as PersonIcon,
    Lock as LockIcon,
    Info as InfoIcon,
    Notifications as NotificationsIcon,
    Language as LanguageIcon,
    School as SchoolIcon,
    AccountBalance as AccountBalanceIcon,
    Interests as InterestsIcon,
    Save as SaveIcon
} from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const FALLBACK_AVATAR = '/storage/WsuhBYEJy9VT5lSb3yV2IlyugJvzt7OEEtmsFeXH.jpg';

const AccountSettings = () => {
    const [settings, setSettings] = useState({
        username: '',
        email: '',
        bio: '',
        phone: '',
        notifications: {
            email: true,
            app: true
        },
        languages: [],
        certifications: [],
        fields_of_interest: [],
        bank_info: null,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        avatar: null
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({
        personal: false,
        password: false,
        additional: false,
        notifications: false
    });
    const [editDialog, setEditDialog] = useState({ open: false, type: '', index: -1, value: null });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isAvatarLoading, setIsAvatarLoading] = useState(true);
    const [avatarSrc, setAvatarSrc] = useState(null);
    const avatarRef = useRef(null);

    useEffect(() => {
        getLearnerSettings(true)
            .then(res => {
                if (res.data) {
                    setSettings(prev => ({
                        ...prev,
                        username: res.data.username || '',
                        email: res.data.email || '',
                        bio: res.data.bio || '',
                        phone: res.data.phone || '',
                        notifications: res.data.notifications || { email: true, app: true },
                        languages: res.data.languages || [],
                        certifications: res.data.certifications || [],
                        fields_of_interest: res.data.fields_of_interest || [],
                        bank_info: res.data.bank_info || null,
                        avatar: res.data.avatar || null
                    }));
                }
            })
            .catch(() => toast.error('Erreur lors du chargement des paramètres'))
            .finally(() => setLoading(false));
    }, []);

    // Initialize avatar source
    useEffect(() => {
        if (!settings.avatar) {
            setAvatarSrc(`${API_URL}${FALLBACK_AVATAR}`);
            setIsAvatarLoading(false);
            return;
        }

        // If avatar is a full URL, use it directly
        if (settings.avatar.startsWith('http')) {
            setAvatarSrc(settings.avatar);
            return;
        }

        // If avatar is a relative path, prepend API_URL
        setAvatarSrc(`${API_URL}${settings.avatar}`);
    }, [settings.avatar]);

    // Handle avatar loading
    const handleAvatarLoad = useCallback(() => {
        setIsAvatarLoading(false);
    }, []);

    const handleAvatarError = useCallback(() => {
        console.log('Avatar load error, using fallback');
        setAvatarSrc(`${API_URL}${FALLBACK_AVATAR}`);
        setIsAvatarLoading(false);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Veuillez sélectionner une image valide');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("L'image ne doit pas dépasser 5MB");
                return;
            }
            setAvatarPreview(URL.createObjectURL(file));
            setSettings(prev => ({
                ...prev,
                avatar: file // Store file object
            }));
        }
    };

    const handleSectionSave = async (section) => {
        setSaving(prev => ({ ...prev, [section]: true }));
        try {
            let dataToSend = {};
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            
            switch(section) {
                case 'personal':
                    dataToSend = {
                        username: settings.username,
                        email: settings.email,
                        bio: settings.bio,
                        phone: settings.phone,
                        avatar: settings.avatar instanceof File ? settings.avatar : null
                    };
                    break;
                case 'password':
                    if (!settings.currentPassword) {
                        toast.error('Veuillez entrer votre mot de passe actuel');
                        return;
                    }
                    if (!settings.newPassword) {
                        toast.error('Veuillez entrer un nouveau mot de passe');
                        return;
                    }
                    if (settings.newPassword !== settings.confirmPassword) {
                        toast.error('Les mots de passe ne correspondent pas');
                        return;
                    }
                    if (!passwordRegex.test(settings.newPassword)) {
                        toast.error('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
                        return;
                    }
                    dataToSend = {
                        current_password: settings.currentPassword,
                        new_password: settings.newPassword,
                        new_password_confirmation: settings.confirmPassword
                    };
                    break;
                case 'additional':
                    dataToSend = {
                        fields_of_interest: settings.fields_of_interest,
                        languages: settings.languages,
                        certifications: settings.certifications,
                        bank_info: settings.bank_info
                    };
                    break;
                case 'notifications':
                    dataToSend = {
                        notifications: settings.notifications
                    };
                    break;
            }

            const response = await updateLearnerSettings(dataToSend);
            if (response.data.data) {
                setSettings(prev => ({
                    ...prev,
                    ...response.data.data,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
                if (section === 'personal' && response.data.data.avatar) {
                    setAvatarPreview(response.data.data.avatar);
                }
                toast.success('Mise à jour réussie !');
            }
        } catch (error) {
            console.error('Save Error:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setSaving(prev => ({ ...prev, [section]: false }));
        }
    };

    const handleEditDialogOpen = (type, index = -1, value = null) => {
        setEditDialog({ open: true, type, index, value });
    };

    const handleEditDialogClose = () => {
        setEditDialog({ open: false, type: '', index: -1, value: null });
    };

    const handleEditDialogSave = (newValue) => {
        const { type, index } = editDialog;
        setSettings(prev => {
            const newArray = [...(prev[type] || [])];
            if (index === -1) {
                newArray.push(newValue);
            } else {
                newArray[index] = newValue;
            }
            return { ...prev, [type]: newArray };
        });
        handleEditDialogClose();
    };

    const handleDelete = (type, index) => {
        setSettings(prev => {
            const newArray = [...(prev[type] || [])];
            newArray.splice(index, 1);
            return { ...prev, [type]: newArray };
        });
    };

    const renderEditDialog = () => {
        const { type, value } = editDialog;

        switch (type) {
            case 'fields_of_interest':
                return (
                    <Dialog open={editDialog.open} onClose={handleEditDialogClose}>
                        <DialogTitle>Ajouter/Modifier un domaine d'intérêt</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Domaine d'intérêt"
                                fullWidth
                                defaultValue={value}
                                onChange={(e) => setEditDialog(prev => ({ ...prev, value: e.target.value }))}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditDialogClose}>Annuler</Button>
                            <Button onClick={() => handleEditDialogSave(editDialog.value)}>Enregistrer</Button>
                        </DialogActions>
                    </Dialog>
                );

            case 'languages':
                return (
                    <Dialog open={editDialog.open} onClose={handleEditDialogClose}>
                        <DialogTitle>Ajouter/Modifier une langue</DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                <TextField
                                    label="Langue"
                                    fullWidth
                                    defaultValue={value?.name}
                                    onChange={(e) => setEditDialog(prev => ({
                                        ...prev,
                                        value: { ...prev.value, name: e.target.value }
                                    }))}
                                />
                                <TextField
                                    label="Code de langue (optionnel)"
                                    fullWidth
                                    defaultValue={value?.code}
                                    onChange={(e) => setEditDialog(prev => ({
                                        ...prev,
                                        value: { ...prev.value, code: e.target.value }
                                    }))}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditDialogClose}>Annuler</Button>
                            <Button onClick={() => handleEditDialogSave(editDialog.value)}>Enregistrer</Button>
                        </DialogActions>
                    </Dialog>
                );

            case 'certifications':
                return (
                    <Dialog open={editDialog.open} onClose={handleEditDialogClose}>
                        <DialogTitle>Ajouter/Modifier une certification</DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                <TextField
                                    label="Nom de la certification"
                                    fullWidth
                                    defaultValue={value?.name}
                                    onChange={(e) => setEditDialog(prev => ({
                                        ...prev,
                                        value: { ...prev.value, name: e.target.value }
                                    }))}
                                />
                                <TextField
                                    label="Institution"
                                    fullWidth
                                    defaultValue={value?.institution}
                                    onChange={(e) => setEditDialog(prev => ({
                                        ...prev,
                                        value: { ...prev.value, institution: e.target.value }
                                    }))}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditDialogClose}>Annuler</Button>
                            <Button onClick={() => handleEditDialogSave(editDialog.value)}>Enregistrer</Button>
                        </DialogActions>
                    </Dialog>
                );

            case 'bank_info':
                return (
                    <Dialog open={editDialog.open} onClose={handleEditDialogClose}>
                        <DialogTitle>Modifier les informations bancaires</DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                <TextField
                                    label="IBAN"
                                    fullWidth
                                    defaultValue={value?.iban}
                                    onChange={(e) => setEditDialog(prev => ({
                                        ...prev,
                                        value: { ...prev.value, iban: e.target.value }
                                    }))}
                                />
                                <TextField
                                    label="BIC"
                                    fullWidth
                                    defaultValue={value?.bic}
                                    onChange={(e) => setEditDialog(prev => ({
                                        ...prev,
                                        value: { ...prev.value, bic: e.target.value }
                                    }))}
                                />
                                <TextField
                                    label="Titulaire du compte"
                                    fullWidth
                                    defaultValue={value?.account_holder}
                                    onChange={(e) => setEditDialog(prev => ({
                                        ...prev,
                                        value: { ...prev.value, account_holder: e.target.value }
                                    }))}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditDialogClose}>Annuler</Button>
                            <Button onClick={() => {
                                setSettings(prev => ({ ...prev, bank_info: editDialog.value }));
                                handleEditDialogClose();
                            }}>Enregistrer</Button>
                        </DialogActions>
                    </Dialog>
                );

            default:
                return null;
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{
            maxWidth: 1400,
            mx: 'auto',
            p: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minHeight: 'calc(100vh - 64px)',
            pt: 0
        }}>
            {/* Header Section */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography
                        variant="h4"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 700,
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Mon Profil
                    </Typography>
                </Box>
            </Box>

            {/* Top Section - Personal Info and Password */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                gap: 4
            }}>
                {/* Personal Information Panel */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        height: 'fit-content'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <PersonIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                        <Typography
                            variant="h5"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 600
                            }}
                        >
                            Informations personnelles
                        </Typography>
                    </Box>

                    {/* Avatar Section */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        mb: 4,
                        p: 3,
                        bgcolor: alpha('#1976d2', 0.04),
                        borderRadius: 2
                    }}>
                        <Box sx={{ position: 'relative' }}>
                            {isAvatarLoading && (
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        bgcolor: 'grey.200',
                                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                        '@keyframes pulse': {
                                            '0%, 100%': {
                                                opacity: 1,
                                            },
                                            '50%': {
                                                opacity: .5,
                                            },
                                        },
                                    }}
                                />
                            )}
                            <Avatar
                                ref={avatarRef}
                                src={avatarPreview || avatarSrc}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    border: '4px solid',
                                    borderColor: 'primary.main',
                                    display: isAvatarLoading ? 'none' : 'block'
                                }}
                                onLoad={handleAvatarLoad}
                                onError={handleAvatarError}
                            />
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="avatar-upload"
                                type="file"
                                onChange={handleImageChange}
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
                                        '&:hover': {
                                            backgroundColor: 'grey.100'
                                        }
                                    }}
                                >
                                    <PhotoCameraIcon />
                                </IconButton>
                            </label>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Cliquez sur l'icône pour changer votre photo de profil
                        </Typography>
                    </Box>

                    {/* Personal Info Fields */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2.5
                    }}>
                        <TextField
                            label="Nom complet"
                            name="username"
                            value={settings.username ?? ''}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={settings.email ?? ''}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            label="Bio"
                            name="bio"
                            value={settings.bio ?? ''}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={3}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                gridColumn: { xs: '1', sm: '1 / -1' }
                            }}
                        />
                        <TextField
                            label="Téléphone"
                            name="phone"
                            value={settings.phone ?? ''}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Box>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={saving.personal}
                            onClick={() => handleSectionSave('personal')}
                            startIcon={saving.personal ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{
                                minWidth: 200,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 600
                            }}
                        >
                            {saving.personal ? 'Enregistrement...' : 'Enregistrer les informations'}
                        </Button>
                    </Box>
                </Paper>

                {/* Password Panel */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <LockIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                        <Typography
                            variant="h5"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 600
                            }}
                        >
                            Changer le mot de passe
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        p: 3,
                        bgcolor: alpha('#1976d2', 0.04),
                        borderRadius: 2,
                        flex: 1
                    }}>
                        <TextField
                            label="Mot de passe actuel"
                            name="currentPassword"
                            type="password"
                            value={settings.currentPassword ?? ''}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            label="Nouveau mot de passe"
                            name="newPassword"
                            type="password"
                            value={settings.newPassword ?? ''}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            helperText="Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            label="Confirmer le nouveau mot de passe"
                            name="confirmPassword"
                            type="password"
                            value={settings.confirmPassword ?? ''}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            error={settings.newPassword && settings.confirmPassword && settings.newPassword !== settings.confirmPassword}
                            helperText={settings.newPassword && settings.confirmPassword && settings.newPassword !== settings.confirmPassword ? "Les mots de passe ne correspondent pas" : ""}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Box>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={saving.password}
                            onClick={() => handleSectionSave('password')}
                            startIcon={saving.password ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{
                                minWidth: 200,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 600
                            }}
                        >
                            {saving.password ? 'Enregistrement...' : 'Changer le mot de passe'}
                        </Button>
                    </Box>
                </Paper>
            </Box>

            {/* Middle Section - Additional Information */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <InfoIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography
                        variant="h5"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 600
                        }}
                    >
                        Informations complémentaires
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 4
                }}>
                    {/* Left Column */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Fields of Interest */}
                        <Box sx={{
                            p: 3,
                            bgcolor: alpha('#1976d2', 0.04),
                            borderRadius: 2
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <InterestsIcon sx={{ color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Domaines d'intérêt
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => handleEditDialogOpen('fields_of_interest')}
                                    color="primary"
                                    sx={{
                                        bgcolor: 'white',
                                        boxShadow: 1,
                                        '&:hover': { bgcolor: 'grey.100' }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            <List sx={{ bgcolor: 'white', borderRadius: 1 }}>
                                {(settings.fields_of_interest || []).map((field, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            '&:last-child': { borderBottom: 'none' }
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {field}
                                                </Typography>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleEditDialogOpen('fields_of_interest', index, field)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleDelete('fields_of_interest', index)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Languages */}
                        <Box sx={{
                            p: 3,
                            bgcolor: alpha('#1976d2', 0.04),
                            borderRadius: 2
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LanguageIcon sx={{ color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Langues
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => handleEditDialogOpen('languages')}
                                    color="primary"
                                    sx={{
                                        bgcolor: 'white',
                                        boxShadow: 1,
                                        '&:hover': { bgcolor: 'grey.100' }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            <List sx={{ bgcolor: 'white', borderRadius: 1 }}>
                                {(settings.languages || []).map((lang, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            '&:last-child': { borderBottom: 'none' }
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {lang.name}
                                                </Typography>
                                            }
                                            secondary={lang.code && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Code: {lang.code}
                                                </Typography>
                                            )}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleEditDialogOpen('languages', index, lang)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleDelete('languages', index)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    {/* Right Column */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Certifications */}
                        <Box sx={{
                            p: 3,
                            bgcolor: alpha('#1976d2', 0.04),
                            borderRadius: 2
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SchoolIcon sx={{ color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Certifications
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => handleEditDialogOpen('certifications')}
                                    color="primary"
                                    sx={{
                                        bgcolor: 'white',
                                        boxShadow: 1,
                                        '&:hover': { bgcolor: 'grey.100' }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            <List sx={{ bgcolor: 'white', borderRadius: 1 }}>
                                {(settings.certifications || []).map((cert, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            '&:last-child': { borderBottom: 'none' }
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {cert.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.secondary">
                                                    Institution: {cert.institution}
                                                </Typography>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleEditDialogOpen('certifications', index, cert)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleDelete('certifications', index)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Bank Info */}
                        <Box sx={{
                            p: 3,
                            bgcolor: alpha('#1976d2', 0.04),
                            borderRadius: 2
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccountBalanceIcon sx={{ color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Informations bancaires
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => handleEditDialogOpen('bank_info', -1, settings.bank_info || {})}
                                    color="primary"
                                    sx={{
                                        bgcolor: 'white',
                                        boxShadow: 1,
                                        '&:hover': { bgcolor: 'grey.100' }
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Box>
                            {settings.bank_info && (
                                <List sx={{ bgcolor: 'white', borderRadius: 1 }}>
                                    <ListItem sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    IBAN
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.secondary">
                                                    {settings.bank_info.iban}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    BIC
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.secondary">
                                                    {settings.bank_info.bic}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    Titulaire du compte
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.secondary">
                                                    {settings.bank_info.account_holder}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                </List>
                            )}
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={saving.additional}
                        onClick={() => handleSectionSave('additional')}
                        startIcon={saving.additional ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{
                            minWidth: 200,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 600
                        }}
                    >
                        {saving.additional ? 'Enregistrement...' : 'Enregistrer les informations'}
                    </Button>
                </Box>
            </Paper>

            {/* Bottom Section - Notifications */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <NotificationsIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography
                        variant="h5"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 600
                        }}
                    >
                        Préférences de notifications
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    gap: 4,
                    flexWrap: 'wrap'
                }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.notifications?.email}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, email: e.target.checked }
                                }))}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Notifications par email
                            </Typography>
                        }
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.notifications?.app}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, app: e.target.checked }
                                }))}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                Notifications dans l'application
                            </Typography>
                        }
                    />
                </Box>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={saving.notifications}
                        onClick={() => handleSectionSave('notifications')}
                        startIcon={saving.notifications ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{
                            minWidth: 200,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 600
                        }}
                    >
                        {saving.notifications ? 'Enregistrement...' : 'Enregistrer les préférences'}
                    </Button>
                </Box>
            </Paper>

            {renderEditDialog()}
        </Box>
    );
};

export default AccountSettings;
