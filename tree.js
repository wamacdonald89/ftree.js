//TREE.js is a library for creating and drawing properly displayed family trees on the HTML canvas element.
//This is a work in progress.
//Authors: Andy MacDonald
//16 June 2015
//--------------------------------------------------------------------------------------------------------
var TREE = (function () {
    "use strict";
    var uID = 0,
        config = {
            width: 100,
            height: 50,
            color: "black",
            bgcolor: "white"
        },
        Tree = function (text, parentId, width, height, color, bgcolor, treeData) {
            this.uid = uID += 1;
            this.parentId = parentId || -1;
            this.text = text;
            this.width = width || config.width;
            this.height = height || config.height;
            this.color = color || config.color;
            this.bgcolor = bgcolor || config.bgcolor;
            this.treeData = treeData || {};
            this.xPos = 0;
            this.yPos = 0;
            this.prelim = 0;
            this.modifier = 0;
            this.leftNeighbor = null;
            this.rightNeighbor = null;
            this.parentTree = null;
            this.children = [];
        };

    /**
     * Gets the vertical level of the tree.
     * @returns {*} A number representing the vertical level of the tree.
     */
    Tree.prototype.getLevel = function () {
        return this.parentId === -1 ? 0 : this.parentTree.getLevel() + 1;
    };

    /**
     * Sets the text color of the tree node.
     * @param color The color to change it to.
     */
    Tree.prototype.setColor = function (color) {
        this.color = color;
    };

    /**
     * Sets the background color of the tree node.
     * @param color The color to change it to.
     */
    Tree.prototype.setbgColor = function (color) {
        this.bgcolor = color;
    };

    /**
     * Visually changes the style of the node if it is 'selected'.
     * @param bool A true or false value representing if node is selected or not.
     */
    Tree.prototype.selected = function (bool) {
        if (bool) {
            this.setColor("white");
            this.setbgColor("red");
        } else {
            this.setColor("black");
            this.setbgColor("white");
        }
    };

    /**
     * Returns the number of children of this tree.
     * @returns {Number} The number of children.
     */
    Tree.prototype.numChildren = function () {
        return this.children.length;
    };

    /**
     * Returns the left sibling of this tree.
     * @returns {*} The left sibling or null.
     */
    Tree.prototype.getLeftSibling = function () {
        return this.leftNeighbor && this.leftNeighbor.parentTree === this.parentTree ? this.leftNeighbor : null;
    };

    /**
     * Returns the right sibling of this tree.
     * @returns {*} The right sibling tree or null.
     */
    Tree.prototype.getRightSibling = function () {
        return this.rightNeighbor && this.rightNeighbor.parentTree === this.parentTree ? this.rightNeighbor : null;
    };

    /**
     * Returns the child at a specified index.
     * @param index The specified index.
     * @returns {*} The child if found or null.
     */
    Tree.prototype.getChildAt = function (index) {
        return this.children[index];
    };

    /**
     * Searches children and returns a tree by UID.
     * @param id The UID to search for.
     * @returns {*} The child if found or null.
     */
    Tree.prototype.getChild = function (id) {
        var i;
        for (i = 0; i < this.children.length; i++) {
            if (this.children[i].uid === id) {
                return this.children[i];
            }
        }
    };

    /**
     * Returns an X value representing the center location of all this tree's children.
     * @returns {*} The center X value.
     */
    Tree.prototype.getChildrenCenter = function () {
        var firstChild = this.getFirstChild(),
            lastChild = this.getLastChild();
        return firstChild.prelim + (lastChild.prelim - firstChild.prelim + lastChild.width) / 2;
    };

    /**
     * Return the first child of this tree.
     * @returns {Object} The child node.
     */
    Tree.prototype.getFirstChild = function () {
        return this.getChildAt(0);
    };

    /**
     * Gets the last child of this tree.
     * @returns {Object} The child node.
     */
    Tree.prototype.getLastChild = function () {
        return this.getChildAt(this.numChildren() - 1);
    };

    /**
     * Adds a tree node to the children to this tree.
     * @param tree The tree to be added.
     */
    Tree.prototype.addChild = function (tree) {
        tree.parentTree = this;
        tree.parentId = this.uid;
        this.children.push(tree);
    };

    /**
     * Find and return a descendant by the UID.
     * @param id The UID to search for.
     * @returns {*} The found tree node or null if not found.
     */
    Tree.prototype.getDescendent = function (id) {
        var children = this.children;
        var found;
        if (this.getChild(id)) {
            return this.getChild(id);
        }
        else {
            for (var i = 0; i < children.length; i++) {
                found = children[i].getDescendent(id);
                if (found) {
                    return found;
                }
            }
        }
    };

    return {

        config : config,
        /**
         * Create and return a new tree.
         * @constructor
         * @param text The textual representation of the tree.
         * @returns {Tree} The newly created tree.
         */
        create: function (text) {
            return new Tree(text);
        },

        /**
         * Removes a tree from it's parents list of children. This effectively removes the tree and all of its
         * descendants from an existing tree.
         * @param tree The tree to be removed.
         */
        destroy: function (tree) {
            if (!tree.parentTree) {
                alert("Removing root node not supported at this time");
                return;
            }
            var children = tree.parentTree.children;
            for (var i = 0; i < children.length; i++) {
                if (children[i].uid === tree.uid) {
                    children.splice(i, 1);
                    break;
                }
            }
        },

        /**
         * Get an array of all nodes in a tree.
         * @param tree The tree.
         * @returns {Array} An array of tree nodes.
         */
        getNodeList: function (tree) {
            var nodeList = [];
            nodeList.push(tree);
            for (var i = 0; i < tree.numChildren(); i++) {
                nodeList = nodeList.concat(this.getNodeList(tree.getChildAt(i)));
            }
            return nodeList;
        },

        /**
         * Clears the canvas.
         * @param context The 2-d context of an html canvas element.
         */
        clear: function (context) {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        },

        /**
         * Draws a well-formed tree on a canvas.
         * @param context The 2-d context of a canvas html element.
         * @param tree The tree that will be drawn.
         */
        draw: function (context, tree) {
            var config = {
                    maxDepth: 100,
                    levelSeparation: 40,
                    siblingSeparation: 20,
                    subtreeSeparation: 20,
                    topXAdjustment: 0,
                    topYAdjustment: 20
                },
                maxLevelHeight = [],
                maxLevelWidth = [],
                previousLevelTree = [],
                rootXOffset = 0,
                rootYOffset = 0,

                /**
                 * Saves the height of a tree at a specified level.
                 * @param tree The tree.
                 * @param level The current vertical level of the tree.
                 */
                setLevelHeight = function (tree, level) {
                    maxLevelHeight[level] = tree.height;
                },

                /**
                 * Saves the width of a tree at a specified level.
                 * @param tree The tree.
                 * @param level The current vertical level of the tree.
                 */
                setLevelWidth = function (tree, level) {
                    maxLevelWidth[level] = tree.width;
                },

                /**
                 * Sets the neighbors of the tree.
                 * @param tree The specified tree
                 * @param level The vertical level of the tree.
                 */
                setNeighbors = function (tree, level) {
                    tree.leftNeighbor = previousLevelTree[level];
                    if (tree.leftNeighbor)
                        tree.leftNeighbor.rightNeighbor = tree;
                    previousLevelTree[level] = tree;
                },

                /**
                 * Returns the leftmost descendant of the tree.
                 * @param tree The specified tree.
                 * @param level The vertical level of the tree.
                 * @param maxlevel The maximum level in which to stop searching.
                 * @returns {*} The leftmost descendant if found, or null.
                 */
                getLeftMost = function (tree, level, maxlevel) {
                    if (level >= maxlevel) return tree;
                    if (tree.numChildren() === 0) return null;
                    var n = tree.numChildren();
                    for (var i = 0; i < n; i++) {
                        var iChild = tree.getChildAt(i);
                        var leftmostDescendant = getLeftMost(iChild, level + 1, maxlevel);
                        if (leftmostDescendant !== null)
                            return leftmostDescendant;
                    }
                    return null;
                },

                /**
                 * Gets the width of the tree.
                 * @param tree The specified tree.
                 * @returns {number} The width of the tree.
                 */
                getNodeSize = function (tree) {
                    return tree.width;
                },

                /**
                 * Part of the first traversal of the tree for positioning. Smaller subtrees that could float between
                 * two adjacent larger subtrees are evenly spaced out.
                 * @param tree
                 * @param level
                 */
                apportion = function (tree, level) {
                    var firstChild = tree.getFirstChild(),
                        firstChildLeftNeighbor = firstChild.leftNeighbor,
                        j = 1;
                    for (var k = config.maxDepth - level; firstChild != null && firstChildLeftNeighbor != null && j <= k;) {
                        var modifierSumRight = 0;
                        var modifierSumLeft = 0;
                        var rightAncestor = firstChild;
                        var leftAncestor = firstChildLeftNeighbor;
                        for (var l = 0; l < j; l++) {
                            rightAncestor = rightAncestor.parentTree;
                            leftAncestor = leftAncestor.parentTree;
                            modifierSumRight += rightAncestor.modifier;
                            modifierSumLeft += leftAncestor.modifier;
                        }
                        var totalGap = (firstChildLeftNeighbor.prelim + modifierSumLeft + getNodeSize(firstChildLeftNeighbor) + config.subtreeSeparation) - (firstChild.prelim + modifierSumRight);
                        if (totalGap > 0) {
                            var subtreeAux = tree;
                            var numSubtrees = 0;
                            for (; subtreeAux != null && subtreeAux != leftAncestor; subtreeAux = subtreeAux.getLeftSibling()) {
                                numSubtrees++;
                            }
                            if (subtreeAux != null) {
                                var subtreeMoveAux = tree;
                                var singleGap = totalGap / numSubtrees;
                                for (; subtreeMoveAux != leftAncestor; subtreeMoveAux = subtreeMoveAux.getLeftSibling()) {
                                    subtreeMoveAux.prelim += totalGap;
                                    subtreeMoveAux.modifier += totalGap;
                                    totalGap -= singleGap;
                                }
                            }
                        }
                        j++;
                        if (firstChild.numChildren() == 0) {
                            firstChild = getLeftMost(tree, 0, j);
                        } else {
                            firstChild = firstChild.getFirstChild();
                        }
                        if (firstChild != null) {
                            firstChildLeftNeighbor = firstChild.leftNeighbor;
                        }
                    }
                },

                /**
                 * A postorder traversal of the tree. Each subtree is manipulated recursively from the bottom to top
                 * and left to right, positioning the rigid units that form each subtree until none are touching each
                 * other. Smaller subtrees are combined, forming larger subtrees until the root has been reached.
                 * @param tree
                 * @param level
                 */
                firstWalk = function (tree, level) {
                    var leftSibling = null;
                    tree.xPos = 0;
                    tree.yPos = 0;
                    tree.prelim = 0;
                    tree.modifier = 0;
                    tree.leftNeighbor = null;
                    tree.rightNeighbor = null;
                    setLevelHeight(tree, level);
                    setLevelWidth(tree, level);
                    setNeighbors(tree, level);
                    if (tree.numChildren() === 0 || level == config.maxDepth) {
                        leftSibling = tree.getLeftSibling();
                        if (leftSibling !== null)
                            tree.prelim = leftSibling.prelim + getNodeSize(leftSibling) + config.siblingSeparation;
                        else
                            tree.prelim = 0;
                    }
                    else {
                        var n = tree.numChildren();
                        for (var i = 0; i < n; i++) {
                            firstWalk(tree.getChildAt(i), level + 1);
                        }
                        var midPoint = tree.getChildrenCenter();
                        midPoint -= getNodeSize(tree) / 2;
                        leftSibling = tree.getLeftSibling();
                        if (leftSibling) {
                            tree.prelim = leftSibling.prelim + getNodeSize(leftSibling) + config.siblingSeparation;
                            tree.modifier = tree.prelim - midPoint;
                            apportion(tree, level);
                        }
                        else {
                            tree.prelim = midPoint;
                        }
                    }
                },

                /**
                 * A preorder traversal. Each node is given it's final X,Y coordinates by summing the preliminary
                 * coordinate and the modifiers of all of its ancestor trees.
                 * @param tree The tree that will be traversed.
                 * @param level The vertical level of the tree.
                 * @param X The X value of the tree.
                 * @param Y The Y value of the tree.
                 */
                secondWalk = function (tree, level, X, Y) {
                    tree.xPos = rootXOffset + tree.prelim + X;
                    tree.yPos = rootYOffset + Y;
                    if (tree.numChildren())
                        secondWalk(tree.getFirstChild(), level + 1, X + tree.modifier, Y + maxLevelHeight[level] + config.levelSeparation);
                    var rightSibling = tree.getRightSibling();
                    if (rightSibling)
                        secondWalk(rightSibling, level, X, Y);
                },

                /**
                 * Assign X,Y position values to the tree and it's descendants.
                 * @param tree The tree to be positioned.
                 */
                positionTree = function (tree) {
                    maxLevelHeight = [];
                    maxLevelWidth = [];
                    previousLevelTree = [];
                    firstWalk(tree, 0);
                    rootXOffset = config.topXAdjustment + tree.xPos;
                    rootYOffset = config.topYAdjustment + tree.yPos;
                    secondWalk(tree, 0, 0, 0);
                    rootXOffset = Math.abs(getMinX(tree)); //Align to left
                    secondWalk(tree, 0, 0, 0);
                },

                getMinX = function (tree) {
                    var nodes = TREE.getNodeList(tree);
                    var min = 0;
                    for (var i = 0; i < nodes.length; i++){
                        if (nodes[i].xPos < min)
                            min = nodes[i].xPos;
                    }
                    return min;
                },

                /**
                 * Draw the tree and it's descendants on the canvass.
                 * @param tree The tree that will be drawn.
                 */
                drawNode = function (tree) {
                    var x = tree.xPos,
                        y = tree.yPos,
                        width = tree.width,
                        height = tree.height,
                        text = tree.text,
                        textWidth = context.measureText(text).width;
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x, y + height);
                    context.lineTo(x + width, y + height);
                    context.lineTo(x + width, y);
                    context.lineTo(x, y);
                    context.lineWidth = 1;
                    context.fillStyle = tree.bgcolor;
                    context.fill();
                    context.stroke();
                    context.strokeStyle = tree.color;
                    context.textBaseline = 'middle';
                    context.strokeText(text, (x + width / 2) - textWidth / 2, y + height / 2, width);
                    context.strokeStyle = "black";
                    if (tree.children.length > 0) {
                        context.beginPath();
                        context.moveTo(x + width / 2, y + height);
                        context.lineTo(x + width / 2, y + height + config.levelSeparation / 2);
                        context.moveTo(tree.getFirstChild().xPos + tree.getFirstChild().width / 2, y + height + config.levelSeparation / 2);
                        context.lineTo(tree.getLastChild().xPos + tree.getLastChild().width / 2, y + height + config.levelSeparation / 2);
                        context.stroke();
                    }
                    if (tree.parentId != -1) {
                        context.beginPath();
                        context.moveTo(x + width / 2, y);
                        context.lineTo(x + width / 2, y - config.levelSeparation / 2);
                        context.stroke();
                    }
                    for (var i = 0; tree.numChildren() > 0 && i < tree.numChildren(); i++) {
                        drawNode(tree.getChildAt(i));
                    }
                };

            positionTree(tree);
            this.clear(context);
            drawNode(tree);
        }
    };
}());