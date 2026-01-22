import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import Document from '@/models/Document';
import AppRegistry from '@/system/services/AppRegistry';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { q: query, type } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    await connectDB();

    const searchQuery = query.trim().toLowerCase();
    const results = {
      files: [],
      documents: [],
      apps: [],
      total: 0,
    };

    // Search in files (if type is 'all' or 'files')
    if (!type || type === 'all' || type === 'files') {
      const files = await File.find({
        $or: [
          { owner: user.id },
          { 'collaborators.user': user.id },
        ],
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { content: { $regex: searchQuery, $options: 'i' } },
        ],
      })
        .populate('owner', 'username email')
        .limit(20);

      results.files = files.map((file) => ({
        id: file._id,
        type: 'file',
        name: file.name,
        content: file.content?.substring(0, 200) || '',
        owner: file.owner,
        lastModified: file.lastModified,
        icon: '📄',
      }));
    }

    // Search in documents (if type is 'all' or 'documents')
    if (!type || type === 'all' || type === 'documents') {
      const documents = await Document.find({
        $or: [
          { owner: user.id },
          { 'collaborators.user': user.id },
        ],
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { content: { $regex: searchQuery, $options: 'i' } },
        ],
      })
        .populate('owner', 'username email')
        .limit(20);

      results.documents = documents.map((doc) => ({
        id: doc._id,
        type: 'document',
        name: doc.title,
        content: doc.content?.substring(0, 200) || '',
        owner: doc.owner,
        lastModified: doc.lastModified,
        icon: '📝',
      }));
    }

    // Search in apps (if type is 'all' or 'apps')
    if (!type || type === 'all' || type === 'apps') {
      const allApps = AppRegistry.getAllApps();
      const matchedApps = allApps.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery) ||
          app.id.toLowerCase().includes(searchQuery),
      );

      results.apps = matchedApps.map((app) => ({
        id: app.id,
        type: 'app',
        name: app.name,
        icon: app.icon,
        component: app.component,
      }));
    }

    // Calculate total results
    results.total =
      results.files.length + results.documents.length + results.apps.length;

    return res.status(200).json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
