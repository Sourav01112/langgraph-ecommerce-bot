
import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'

interface RawMaterial {
  id: string
  name: string
  category: string
  price: number
  image: string
}

interface RawMaterialCardProps {
  material: RawMaterial
  onAddToCart: (material: RawMaterial) => void
}

const RawMaterialCard: React.FC<RawMaterialCardProps> = ({ material, onAddToCart }) => (
  <Card sx={{ maxWidth: 345, m: 1 }}>
    <CardMedia
      component="img"
      height="140"
      image={material.image}
      alt={material.name}
    />
    <CardContent>
      <Typography gutterBottom variant="h6" component="div">
        {material.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Category: {material.category}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
        Price: ${material.price}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small" onClick={() => onAddToCart(material)}>
        Add to Cart
      </Button>
    </CardActions>
  </Card>
)

export default RawMaterialCard
