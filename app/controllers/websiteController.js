import validator from 'validator';
import Categorie from '../models/Categorie.js';
import Operation from '../models/Operation.js'; 
import Budget from '../models/Budget.js';  

const websiteController = {

 operation: async (req, res) => {
  try {
    if (req.method === 'POST' || req.method === 'PUT') {
      const { amount, category, id } = req.body;

      if (
        !amount ||
        !validator.isNumeric(amount.toString()) ||
        Number(amount) <= 0 ||
        !category ||
        !validator.isAlpha(category)
      ) {
        return res.status(400).json({ error: 'Invalid input: amount and category are required and must be valid.' });
      }

      let operation;
      if (req.method === 'POST') {
        operation = await Operation.create({ montant: amount, categorie: category });
      } else {
        operation = await Operation.update(
          { montant: amount, categorie: category },
          { where: { id }, returning: true }
        );
      }
      res.json({ message: `${req.method} operation`, data: operation });
    } else if (req.method === 'GET') {
      const operations = await Operation.findAll();
      res.json({ message: 'GET operation', data: operations });
    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      await Operation.destroy({ where: { id } });
      res.json({ message: 'DELETE operation', id });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
},

  budget: async (req, res) => {
    try {
      if (req.method === 'POST' || req.method === 'PUT') {
        const { total } = req.body;

        if (
          !total ||
          !validator.isNumeric(total.toString()) ||
          Number(total) <= 0
        ) {
          return res.status(400).json({ error: 'Invalid input: total must be a positive number.' });
        }

        let budget;
        if (req.method === 'POST') {
          budget = await Budget.create({ total });
        } else {
          
          const { id } = req.body;
          budget = await Budget.update(
            { total },
            { where: { id }, returning: true }
          );
        }
        res.json({ message: `${req.method} budget`, data: budget });
      } else if (req.method === 'GET') {
        const budgets = await Budget.findAll();
        res.json({ message: 'GET budget', data: budgets });
      } else if (req.method === 'DELETE') {
        const { id } = req.body;
        await Budget.destroy({ where: { id } });
        res.json({ message: 'DELETE budget', id });
      } else {
        res.status(405).json({ error: 'Method Not Allowed' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Database error', details: error.message });
    }
  },

  overview: async (req, res) => {
    try {
      const totalOperation = await Operation.sum('montant');
      const totalBudget = await Budget.sum('total');
      const remaining = totalBudget - totalOperation;
      res.json({
        message: 'Overview endpoint',
        data: {
          totalOperation,
          totalBudget,
          remaining
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Database error', details: error.message });
    }
  },

  stats: async (req, res) => {
    try {
      const stats = await Operation.findAll({
        attributes: [
          'categorie',
          [Operation.sequelize.fn('SUM', Operation.sequelize.col('montant')), 'total']
        ],
        group: ['categorie']
      });
      res.json({
        message: 'Operations stats endpoint',
        stats
      });
    } catch (error) {
      res.status(500).json({ error: 'Database error', details: error.message });
    }
  },

  categories: async (req, res) => {
    try {
      const categories = await Categorie.findAll({ attributes: ['nom_categorie'] });
      res.json({
        message: 'Categories endpoint',
        categories: categories.map(cat => cat.nom_categorie)
      });
    } catch (error) {
      res.status(500).json({ error: 'Database error', details: error.message });
    }
  }

};

export default websiteController;